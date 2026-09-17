import hmac
import json
import os
import threading
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from urllib.parse import quote
from uuid import UUID

import jwt
import structlog
import uvicorn
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    FastAPI,
    Header,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from pixtall.auth import (
    ChangePasswordRequest,
    EmailVerificationRequest,
    EmailVerificationResendRequest,
    ForgotPasswordRequest,
    GoogleAuthenticationError,
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    create_access_token,
    create_email_verification_code,
    create_password_reset_token,
    hash_email_verification_code,
    hash_password,
    hash_password_reset_token,
    verify_google_credential,
    verify_password,
)
from pixtall.billing import (
    AccountResponse,
    BillingConfigurationError,
    BillingError,
    BillingSummary,
    CancelResponse,
    CheckoutRequest,
    CheckoutResponse,
    ConfirmRequest,
    ConfirmResponse,
    PaymentPage,
    PlanResponse,
    ProviderRequestError,
    billing_summary,
    bootstrap_account,
    cancel_subscription,
    confirm_checkout,
    create_checkout,
    list_plans,
    payment_history,
    process_webhook,
    verify_webhook_signature,
)
from pixtall.core import (
    CreditTransaction,
    GenerationJob,
    GenerationRequest,
    HealthResponse,
    InsufficientCredits,
    JobNotFound,
    JobResponse,
    MissingPlan,
    MissingWallet,
    PasswordResetToken,
    Settings,
    SignupVerification,
    TransactionPage,
    TransactionResponse,
    User,
    Wallet,
    WalletResponse,
    expire_credit_grants,
    get_owned_job,
    get_session,
    get_settings,
    grant_signup_trial,
    submit_job,
)
from pixtall.email_delivery import (
    safely_send,
    send_email_verification_code,
    send_google_signin_reminder,
    send_password_changed_email,
    send_password_reset_email,
)
from pixtall.worker import run as run_worker

logger = structlog.get_logger()


@dataclass(frozen=True)
class Identity:
    user_id: UUID
    email: str | None = None
    name: str | None = None


def _bearer_token(authorization: str | None) -> str:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
        )
    return token


def current_identity(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> Identity:
    if settings.auth_mode == "development":
        return Identity(settings.dev_user_id, "dev@pixtall.local", "Development User")

    token = _bearer_token(authorization)

    if settings.auth_mode == "custom":
        try:
            claims = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm],
                audience=settings.jwt_audience,
                issuer=settings.jwt_issuer,
                leeway=settings.jwt_leeway_seconds,
                options={"require": ["sub", "iss", "aud", "iat", "nbf", "exp"]},
            )
            user_id = UUID(claims["sub"])
            user = session.get(User, user_id)
            token_version = int(claims.get("ver", 0))
            if user is None or token_version != user.auth_version:
                raise ValueError("Session is no longer valid")
            return Identity(
                user_id,
                str(claims["email"]) if claims.get("email") else None,
                str(claims["name"]) if claims.get("name") else None,
            )
        except (jwt.PyJWTError, KeyError, TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token",
            ) from exc

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication mode not supported",
    )


router = APIRouter()


def _billing_http_error(exc: BillingError) -> HTTPException:
    if isinstance(exc, BillingConfigurationError):
        return HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    if isinstance(exc, ProviderRequestError):
        return HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


SIGNUP_VERIFICATION_RESPONSE = MessageResponse(
    message="Enter the verification code sent to your email."
)


def _send_signup_code(
    settings: Settings,
    session: Session,
    verification: SignupVerification,
    code: str,
) -> None:
    try:
        send_email_verification_code(
            settings,
            recipient=verification.email,
            name=verification.name,
            code=code,
        )
    except Exception as exc:
        verification.last_sent_at = datetime.now(UTC) - timedelta(
            seconds=settings.email_verification_resend_seconds
        )
        session.commit()
        logger.exception("signup_verification_email_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send the verification email. Please try again.",
        ) from exc


@router.post(
    "/v1/auth/signup",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["auth"],
)
def signup(
    request: SignupRequest,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> MessageResponse:
    if not settings.smtp_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email verification is not configured",
        )

    if session.scalar(select(User).where(User.email == request.email)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    now = datetime.now(UTC)
    verification = session.scalar(
        select(SignupVerification).where(SignupVerification.email == request.email)
    )
    if verification is not None and (
        now - verification.last_sent_at
    ).total_seconds() < settings.email_verification_resend_seconds:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before requesting another code.",
        )

    code, code_hash = create_email_verification_code(request.email, settings.jwt_secret)
    if verification is None:
        verification = SignupVerification(
            email=request.email,
            name=request.name,
            hashed_password=hash_password(request.password),
            code_hash=code_hash,
            expires_at=now + timedelta(minutes=settings.email_verification_code_minutes),
            attempts=0,
            last_sent_at=now,
        )
        session.add(verification)
    else:
        verification.name = request.name
        verification.hashed_password = hash_password(request.password)
        verification.code_hash = code_hash
        verification.expires_at = now + timedelta(
            minutes=settings.email_verification_code_minutes
        )
        verification.attempts = 0
        verification.last_sent_at = now
    session.commit()
    _send_signup_code(settings, session, verification, code)
    return SIGNUP_VERIFICATION_RESPONSE


@router.post("/v1/auth/signup/verify", response_model=TokenResponse, tags=["auth"])
def verify_signup_email(
    request: EmailVerificationRequest,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> TokenResponse:
    now = datetime.now(UTC)
    verification = session.scalar(
        select(SignupVerification)
        .where(SignupVerification.email == request.email)
        .with_for_update()
    )
    if verification is None or verification.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification code is invalid or has expired.",
        )
    if verification.attempts >= settings.email_verification_max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Request a new verification code.",
        )

    submitted_hash = hash_email_verification_code(
        request.email,
        request.code,
        settings.jwt_secret,
    )
    if not hmac.compare_digest(submitted_hash, verification.code_hash):
        verification.attempts += 1
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification code is invalid or has expired.",
        )

    user = User(
        id=uuid.uuid4(),
        email=verification.email,
        name=verification.name,
        hashed_password=verification.hashed_password,
        auth_version=0,
    )
    session.add(user)
    session.delete(verification)
    try:
        grant_signup_trial(session, user)
        session.commit()
    except MissingPlan as exc:
        session.rollback()
        raise HTTPException(
            status_code=503, detail="Trial credits are temporarily unavailable."
        ) from exc
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from exc
    return TokenResponse(
        access_token=create_access_token(
            str(user.id),
            user.email,
            user.name,
            user.auth_version,
        )
    )


@router.post(
    "/v1/auth/signup/resend",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["auth"],
)
def resend_signup_code(
    request: EmailVerificationResendRequest,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> MessageResponse:
    if not settings.smtp_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email verification is not configured",
        )

    verification = session.scalar(
        select(SignupVerification)
        .where(SignupVerification.email == request.email)
        .with_for_update()
    )
    if verification is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start the sign-up process again.",
        )

    now = datetime.now(UTC)
    if (
        now - verification.last_sent_at
    ).total_seconds() < settings.email_verification_resend_seconds:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before requesting another code.",
        )

    code, verification.code_hash = create_email_verification_code(
        verification.email,
        settings.jwt_secret,
    )
    verification.expires_at = now + timedelta(
        minutes=settings.email_verification_code_minutes
    )
    verification.attempts = 0
    verification.last_sent_at = now
    session.commit()
    _send_signup_code(settings, session, verification, code)
    return SIGNUP_VERIFICATION_RESPONSE


@router.post("/v1/auth/login", response_model=TokenResponse, tags=["auth"])
def login(
    request: LoginRequest,
    session: Session = Depends(get_session),
) -> TokenResponse:
    user = session.scalar(select(User).where(User.email == request.email))
    if (
        not user
        or not user.hashed_password
        or not verify_password(request.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(
        access_token=create_access_token(
            str(user.id),
            user.email,
            user.name,
            user.auth_version,
        )
    )


@router.post("/v1/auth/google", response_model=TokenResponse, tags=["auth"])
def google_login(
    request: GoogleAuthRequest,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> TokenResponse:
    try:
        google_identity = verify_google_credential(request.credential, settings.google_client_id)
    except GoogleAuthenticationError as exc:
        status_code = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if not settings.google_client_id
            else status.HTTP_401_UNAUTHORIZED
        )
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc

    user = session.scalar(select(User).where(User.email == google_identity.email))
    is_new_user = user is None
    if user is None:
        user = User(
            id=uuid.uuid4(),
            email=str(google_identity.email),
            name=google_identity.name,
            hashed_password=None,
            auth_version=0,
        )
        session.add(user)
    elif google_identity.name and not user.name:
        user.name = google_identity.name

    try:
        if is_new_user:
            grant_signup_trial(session, user)
        session.commit()
    except MissingPlan as exc:
        session.rollback()
        raise HTTPException(
            status_code=503, detail="Trial credits are temporarily unavailable."
        ) from exc
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create Google account",
        ) from exc

    return TokenResponse(
        access_token=create_access_token(
            str(user.id),
            user.email,
            user.name,
            user.auth_version,
        )
    )


@router.post("/v1/auth/password/change", response_model=TokenResponse, tags=["auth"])
def change_password(
    request: ChangePasswordRequest,
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> TokenResponse:
    user = session.scalar(
        select(User).where(User.id == identity.user_id).with_for_update()
        .execution_options(populate_existing=True)
    )
    if user is None:
        raise HTTPException(status_code=401, detail="Please sign in again.")
    if not user.hashed_password:
        raise HTTPException(
            status_code=400, detail="This account uses Google. Manage your password through Google."
        )
    if not verify_password(request.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    user.hashed_password = hash_password(request.password)
    user.auth_version += 1
    now = datetime.now(UTC)
    for token in session.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ):
        token.used_at = now
    session.commit()
    return TokenResponse(
        access_token=create_access_token(
            str(user.id),
            user.email,
            user.name,
            user.auth_version,
        )
    )


PASSWORD_RESET_RESPONSE = MessageResponse(
    message="If an account exists for this email, a password reset link has been sent."
)


@router.post(
    "/v1/auth/password/forgot",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["auth"],
)
def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> MessageResponse:
    if not settings.smtp_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Password reset email is not configured",
        )

    user = session.scalar(select(User).where(User.email == request.email))
    if user is None:
        return PASSWORD_RESET_RESPONSE

    now = datetime.now(UTC)
    latest = session.scalar(
        select(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id)
        .order_by(PasswordResetToken.created_at.desc())
        .limit(1)
    )
    if latest is not None and (
        now - latest.created_at
    ).total_seconds() < settings.password_reset_request_cooldown_seconds:
        return PASSWORD_RESET_RESPONSE

    if not user.hashed_password:
        _, request_hash = create_password_reset_token()
        session.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=request_hash,
                expires_at=now,
                used_at=now,
            )
        )
        session.commit()
        background_tasks.add_task(
            safely_send,
            "google_signin_reminder",
            send_google_signin_reminder,
            settings,
            recipient=str(user.email),
            name=user.name,
        )
        return PASSWORD_RESET_RESPONSE

    for outstanding in session.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ):
        outstanding.used_at = now

    token, token_hash = create_password_reset_token()
    session.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=now + timedelta(minutes=settings.password_reset_token_minutes),
        )
    )
    session.commit()

    reset_url = (
        f"{str(settings.frontend_url).rstrip('/')}/reset-password"
        f"?token={quote(token, safe='')}"
    )
    background_tasks.add_task(
        safely_send,
        "password_reset",
        send_password_reset_email,
        settings,
        recipient=str(user.email),
        name=user.name,
        reset_url=reset_url,
    )
    return PASSWORD_RESET_RESPONSE


@router.post(
    "/v1/auth/password/reset",
    response_model=MessageResponse,
    tags=["auth"],
)
def reset_password(
    request: ResetPasswordRequest,
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> MessageResponse:
    now = datetime.now(UTC)
    reset_token = session.scalar(
        select(PasswordResetToken)
        .where(PasswordResetToken.token_hash == hash_password_reset_token(request.token))
        .with_for_update()
    )
    if (
        reset_token is None
        or reset_token.used_at is not None
        or reset_token.expires_at <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired.",
        )

    user = session.get(User, reset_token.user_id)
    if user is None or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired.",
        )

    user.hashed_password = hash_password(request.password)
    user.auth_version += 1
    for token_record in session.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ):
        token_record.used_at = now
    session.commit()

    if settings.smtp_configured:
        background_tasks.add_task(
            safely_send,
            "password_changed",
            send_password_changed_email,
            settings,
            recipient=str(user.email),
            name=user.name,
        )
    return MessageResponse(message="Your password has been updated. You can now log in.")


@router.get("/health/live", response_model=HealthResponse, tags=["health"])
def live() -> HealthResponse:
    return HealthResponse()


@router.get("/health/ready", response_model=HealthResponse, tags=["health"])
def ready(session: Session = Depends(get_session)) -> HealthResponse:
    session.execute(text("SELECT 1"))
    return HealthResponse()


@router.get("/v1/plans", response_model=list[PlanResponse], tags=["billing"])
def read_plans(session: Session = Depends(get_session)) -> list[PlanResponse]:
    return list_plans(session)


@router.post("/v1/account/bootstrap", response_model=AccountResponse, tags=["account"])
def provision_account(
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> AccountResponse:
    return bootstrap_account(
        session,
        user_id=identity.user_id,
        email=identity.email,
        name=identity.name,
    )


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
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
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


@router.get("/v1/gallery", tags=["generation"])
def read_gallery(
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> dict[str, list[dict[str, object]]]:
    jobs = list(
        session.scalars(
            select(GenerationJob)
            .options(selectinload(GenerationJob.outputs))
            .where(GenerationJob.user_id == identity.user_id)
            .order_by(GenerationJob.created_at.desc())
            .limit(100)
        )
    )
    sessions: list[dict[str, object]] = []
    for job in jobs:
        photos = [output.result_reference for output in job.outputs if output.result_reference]
        if not photos:
            continue
        sessions.append(
            {
                "id": str(job.id),
                "title": str(job.request_payload.get("product_subcategory") or "Generated images"),
                "tag": job.quality.value,
                "date": job.created_at.date().isoformat(),
                "aspect": str(job.request_payload.get("size") or "1:1"),
                "photos": photos,
            }
        )
    return {"sessions": sessions}


@router.get("/v1/products", tags=["generation"])
def read_products(
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> dict[str, list[dict[str, object]]]:
    jobs = list(
        session.scalars(
            select(GenerationJob)
            .where(GenerationJob.user_id == identity.user_id)
            .order_by(GenerationJob.created_at.desc())
            .limit(100)
        )
    )
    seen_images: set[str] = set()
    products: list[dict[str, object]] = []
    for job in jobs:
        image = job.request_payload.get("product_image_base64")
        if not isinstance(image, str) or not image or image in seen_images:
            continue
        seen_images.add(image)
        products.append(
            {
                "id": str(job.id),
                "url": image,
                "productName": str(job.request_payload.get("product_subcategory") or "Product"),
                "marketplace": str(job.request_payload.get("intended_use") or ""),
                "createdAt": job.created_at.isoformat(),
            }
        )
    return {"products": products}


@router.get("/v1/wallet", response_model=WalletResponse, tags=["credits"])
def read_wallet(
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> WalletResponse:
    wallet = session.scalar(
        select(Wallet).where(Wallet.user_id == identity.user_id).with_for_update()
    )
    if wallet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    expire_credit_grants(session, user_id=identity.user_id, wallet=wallet)
    session.commit()
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
            .order_by(CreditTransaction.created_at.desc(), CreditTransaction.id.desc())
            .limit(limit)
            .offset(offset)
        )
    )
    return TransactionPage(
        items=[TransactionResponse.model_validate(item) for item in items],
        limit=limit,
        offset=offset,
    )


@router.post("/v1/billing/checkout", response_model=CheckoutResponse, tags=["billing"])
def start_checkout(
    request: CheckoutRequest,
    idempotency_key: str = Header(min_length=8, max_length=200, alias="Idempotency-Key"),
    identity: Identity = Depends(current_identity),
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> CheckoutResponse:
    try:
        return create_checkout(
            session,
            user_id=identity.user_id,
            idempotency_key=idempotency_key,
            plan_code=request.plan_code,
            currency=request.currency,
            settings=settings,
        )
    except BillingError as exc:
        session.rollback()
        raise _billing_http_error(exc) from exc


@router.post("/v1/billing/confirm", response_model=ConfirmResponse, tags=["billing"])
def confirm_payment(
    request: ConfirmRequest,
    identity: Identity = Depends(current_identity),
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> ConfirmResponse:
    try:
        return confirm_checkout(
            session,
            user_id=identity.user_id,
            request=request,
            settings=settings,
        )
    except BillingError as exc:
        session.rollback()
        raise _billing_http_error(exc) from exc


@router.get("/v1/billing/summary", response_model=BillingSummary, tags=["billing"])
def read_billing_summary(
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> BillingSummary:
    try:
        return billing_summary(session, user_id=identity.user_id)
    except BillingError as exc:
        session.rollback()
        raise _billing_http_error(exc) from exc


@router.get("/v1/billing/transactions", response_model=PaymentPage, tags=["billing"])
def read_billing_transactions(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    identity: Identity = Depends(current_identity),
    session: Session = Depends(get_session),
) -> PaymentPage:
    return payment_history(
        session,
        user_id=identity.user_id,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/v1/billing/subscription/cancel",
    response_model=CancelResponse,
    tags=["billing"],
)
def cancel_current_subscription(
    identity: Identity = Depends(current_identity),
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> CancelResponse:
    try:
        return cancel_subscription(
            session,
            user_id=identity.user_id,
            settings=settings,
        )
    except BillingError as exc:
        session.rollback()
        raise _billing_http_error(exc) from exc


@router.post("/v1/webhooks/razorpay", tags=["billing"])
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(default=None),
    x_razorpay_event_id: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> dict[str, str]:
    raw_body = await request.body()
    try:
        verify_webhook_signature(raw_body, x_razorpay_signature, settings)
        payload = json.loads(raw_body)
        if not isinstance(payload, dict):
            raise BillingError("Invalid webhook payload")
        event_id = x_razorpay_event_id or str(payload.get("id") or "")
        if not event_id:
            raise BillingError("Webhook event ID is missing")
        return {"status": process_webhook(session, event_id=event_id, payload=payload)}
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON") from exc
    except BillingError as exc:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


def create_app() -> FastAPI:
    settings = get_settings()
    structlog.configure(processors=[structlog.processors.JSONRenderer()])

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        stop_event = threading.Event()
        worker_thread = threading.Thread(target=run_worker, args=(stop_event,), daemon=True)
        worker_thread.start()
        yield
        stop_event.set()
        worker_thread.join(timeout=5)

    application = FastAPI(
        title="Pixtall Credit and Generation API",
        version="0.1.0",
        description="Durable credit reservation and asynchronous image-generation orchestration.",
        lifespan=lifespan,
    )
    application.state.settings = settings
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=(
            r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
            if settings.app_env == "development"
            else None
        ),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Idempotency-Key", "Authorization"],
    )
    application.include_router(router)
    return application


app = create_app()


def run() -> None:
    uvicorn.run(
        "pixtall.api:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8000")),
    )
