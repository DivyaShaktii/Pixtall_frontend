from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from pixtall.auth import Identity, current_identity
from pixtall.db import get_session
from pixtall.models import CreditTransaction, Wallet
from pixtall.schemas import (
    GenerationRequest,
    HealthResponse,
    JobResponse,
    TransactionPage,
    TransactionResponse,
    WalletResponse,
)
from pixtall.services import (
    InsufficientCredits,
    JobNotFound,
    MissingPlan,
    MissingWallet,
    get_owned_job,
    submit_job,
)

router = APIRouter()


@router.get("/health/live", response_model=HealthResponse, tags=["health"])
def live() -> HealthResponse:
    return HealthResponse()


@router.get("/health/ready", response_model=HealthResponse, tags=["health"])
def ready(session: Session = Depends(get_session)) -> HealthResponse:
    session.execute(text("SELECT 1"))
    return HealthResponse()


@router.post(
    "/v1/generation-jobs",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["generation"],
)
def create_job(
    request: GenerationRequest,
    response: Response,
    idempotency_key: str = Header(min_length=8, max_length=200, alias="Idempotency-Key"),
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> JobResponse:
    try:
        job = submit_job(
            session,
            user_id=identity.user_id,
            idempotency_key=idempotency_key,
            request=request,
        )
    except InsufficientCredits as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except (MissingPlan, MissingWallet) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    response.headers["Location"] = f"/v1/generation-jobs/{job.id}"
    return JobResponse.model_validate(job)


@router.get("/v1/generation-jobs/{job_id}", response_model=JobResponse, tags=["generation"])
def read_job(
    job_id: UUID,
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> JobResponse:
    try:
        return JobResponse.model_validate(
            get_owned_job(session, user_id=identity.user_id, job_id=job_id)
        )
    except JobNotFound as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/v1/wallet", response_model=WalletResponse, tags=["credits"])
def read_wallet(
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> WalletResponse:
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == identity.user_id))
    if wallet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    return WalletResponse(
        available_credits=wallet.available_credits,
        reserved_credits=wallet.reserved_credits,
        lifetime_consumed_credits=wallet.lifetime_consumed_credits,
    )


@router.get("/v1/credit-transactions", response_model=TransactionPage, tags=["credits"])
def read_transactions(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> TransactionPage:
    items = list(
        session.scalars(
            select(CreditTransaction)
            .where(CreditTransaction.user_id == identity.user_id)
            .order_by(CreditTransaction.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    )
    return TransactionPage(
        items=[TransactionResponse.model_validate(item) for item in items],
        limit=limit,
        offset=offset,
    )
