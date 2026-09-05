from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from pixtall.models import (
    CreditTransaction,
    GenerationJob,
    GenerationOutput,
    ImageQuality,
    JobStatus,
    Plan,
    Subscription,
    TransactionType,
    User,
    Wallet,
)
from pixtall.schemas import GenerationRequest


class DomainError(Exception):
    """Base class for expected business-rule failures."""


class InsufficientCredits(DomainError):
    pass


class MissingWallet(DomainError):
    pass


class MissingPlan(DomainError):
    pass


class JobNotFound(DomainError):
    pass


def _active_plan(session: Session, user_id: UUID) -> Plan:
    plan = session.scalar(
        select(Plan)
        .join(Subscription, Subscription.plan_id == Plan.id)
        .where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Plan.active.is_(True),
        )
        .order_by(Subscription.starts_at.desc())
        .limit(1)
    )
    if plan is None:
        raise MissingPlan("An active plan is required")
    return plan


def _wallet_for_update(session: Session, user_id: UUID) -> Wallet:
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == user_id).with_for_update())
    if wallet is None:
        raise MissingWallet("Wallet not found")
    return wallet


def _ledger(
    session: Session,
    *,
    user_id: UUID,
    job_id: UUID,
    kind: TransactionType,
    credits: int,
    wallet: Wallet,
) -> None:
    session.add(
        CreditTransaction(
            user_id=user_id,
            job_id=job_id,
            type=kind,
            credits=credits,
            available_balance_after=wallet.available_credits,
            reserved_balance_after=wallet.reserved_credits,
        )
    )


def submit_job(
    session: Session, *, user_id: UUID, idempotency_key: str, request: GenerationRequest
) -> GenerationJob:
    existing = session.scalar(
        select(GenerationJob).where(
            GenerationJob.user_id == user_id,
            GenerationJob.idempotency_key == idempotency_key,
        )
    )
    if existing:
        return existing

    plan = _active_plan(session, user_id)
    per_image = (
        plan.standard_image_credits
        if request.quality == ImageQuality.STANDARD
        else plan.premium_image_credits
    )
    cost = per_image * request.image_count
    wallet = _wallet_for_update(session, user_id)
    if wallet.available_credits < cost:
        raise InsufficientCredits(f"Generation requires {cost} credits")

    job = GenerationJob(
        user_id=user_id,
        idempotency_key=idempotency_key,
        quality=request.quality,
        image_count=request.image_count,
        credit_cost=cost,
        reserved_credits=cost,
        request_payload=request.model_dump(mode="json"),
    )
    session.add(job)
    session.flush()
    wallet.available_credits -= cost
    wallet.reserved_credits += cost
    _ledger(
        session,
        user_id=user_id,
        job_id=job.id,
        kind=TransactionType.RESERVED,
        credits=cost,
        wallet=wallet,
    )
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        duplicate = session.scalar(
            select(GenerationJob).where(
                GenerationJob.user_id == user_id,
                GenerationJob.idempotency_key == idempotency_key,
            )
        )
        if duplicate is None:
            raise
        return duplicate
    session.refresh(job)
    return job


def get_owned_job(session: Session, *, user_id: UUID, job_id: UUID) -> GenerationJob:
    job = session.scalar(
        select(GenerationJob)
        .options(selectinload(GenerationJob.outputs))
        .where(GenerationJob.id == job_id, GenerationJob.user_id == user_id)
    )
    if job is None:
        raise JobNotFound("Generation job not found")
    return job


def claim_job(session: Session, *, worker_id: str, lease_seconds: int) -> GenerationJob | None:
    now = datetime.now(UTC)
    job = session.scalar(
        select(GenerationJob)
        .where(
            GenerationJob.available_at <= now,
            (
                GenerationJob.status.in_([JobStatus.QUEUED, JobStatus.RETRYING])
                | (
                    (GenerationJob.status == JobStatus.PROCESSING)
                    & (GenerationJob.lease_expires_at < now)
                )
            ),
        )
        .order_by(GenerationJob.created_at)
        .with_for_update(skip_locked=True)
        .limit(1)
    )
    if job is None:
        session.rollback()
        return None
    job.status = JobStatus.PROCESSING
    job.attempt_count += 1
    job.lease_owner = worker_id
    job.lease_expires_at = now + timedelta(seconds=lease_seconds)
    session.commit()
    session.refresh(job)
    return job


def retry_job(session: Session, *, job_id: UUID, delay_seconds: float, error: str) -> None:
    job = session.get(GenerationJob, job_id)
    if job is None or job.status != JobStatus.PROCESSING:
        return
    job.status = JobStatus.RETRYING
    job.available_at = datetime.now(UTC) + timedelta(seconds=delay_seconds)
    job.safe_error = error
    job.lease_owner = None
    job.lease_expires_at = None
    session.commit()


def settle_job(
    session: Session,
    *,
    job_id: UUID,
    results: list[str | None],
    errors: dict[int, str],
    terminal_error: str | None = None,
) -> None:
    job = session.scalar(select(GenerationJob).where(GenerationJob.id == job_id).with_for_update())
    if job is None or job.status in {
        JobStatus.COMPLETED,
        JobStatus.PARTIALLY_COMPLETED,
        JobStatus.FAILED,
    }:
        return
    wallet = _wallet_for_update(session, job.user_id)
    successful = sum(result is not None for result in results)
    per_image = job.credit_cost // job.image_count
    consumed = successful * per_image
    released = job.reserved_credits - consumed

    for index in range(job.image_count):
        session.add(
            GenerationOutput(
                job_id=job.id,
                output_index=index,
                result_reference=results[index] if index < len(results) else None,
                error=errors.get(index),
            )
        )
    wallet.reserved_credits -= job.reserved_credits
    wallet.available_credits += released
    wallet.lifetime_consumed_credits += consumed
    job.consumed_credits = consumed
    job.released_credits = released
    job.lease_owner = None
    job.lease_expires_at = None
    job.safe_error = terminal_error
    if successful == job.image_count:
        job.status = JobStatus.COMPLETED
    elif successful:
        job.status = JobStatus.PARTIALLY_COMPLETED
    else:
        job.status = JobStatus.FAILED
    if consumed:
        _ledger(
            session,
            user_id=job.user_id,
            job_id=job.id,
            kind=TransactionType.USED,
            credits=consumed,
            wallet=wallet,
        )
    if released:
        _ledger(
            session,
            user_id=job.user_id,
            job_id=job.id,
            kind=TransactionType.RELEASED,
            credits=released,
            wallet=wallet,
        )
    session.commit()


def ensure_development_user(session: Session, user_id: UUID) -> None:
    if session.get(User, user_id) is None:
        session.add(User(id=user_id, email="developer@localhost", name="Local Developer"))
        session.add(Wallet(user_id=user_id, available_credits=10_000))
        session.commit()
