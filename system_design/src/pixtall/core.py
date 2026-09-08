import uuid
from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from functools import lru_cache
from typing import Any, Literal
from uuid import UUID as UUIDValue

from pydantic import (
    AnyHttpUrl,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
    func,
    select,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    selectinload,
    sessionmaker,
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://postgres:password@localhost:5432/pixtall"
    auth_mode: Literal["development", "custom"] = "development"
    dev_user_id: UUIDValue = UUIDValue("00000000-0000-0000-0000-000000000001")
    jwt_secret: str = "change_me_in_production"
    jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
    jwt_expires_in_minutes: int = 1440
    jwt_issuer: str = "pixtall-api"
    jwt_audience: str = "pixtall-web"
    jwt_leeway_seconds: int = Field(default=30, ge=0, le=300)
    google_client_id: str | None = None
    frontend_url: AnyHttpUrl = AnyHttpUrl("http://localhost:5173")
    smtp_host: str | None = None
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: EmailStr | None = None
    smtp_from_name: str = "Pixtall"
    smtp_use_ssl: bool = False
    smtp_timeout_seconds: float = Field(default=15, ge=1, le=60)
    email_verification_code_minutes: int = Field(default=10, ge=5, le=30)
    email_verification_max_attempts: int = Field(default=5, ge=3, le=10)
    email_verification_resend_seconds: int = Field(default=60, ge=30, le=3600)
    password_reset_token_minutes: int = Field(default=20, ge=5, le=60)
    password_reset_request_cooldown_seconds: int = Field(default=60, ge=30, le=3600)
    railway_backend_url: AnyHttpUrl = Field(
        default=AnyHttpUrl(
            "https://pixtallbackend-production-9ec3.up.railway.app/generate_image"
        )
    )
    worker_concurrency: int = Field(default=4, ge=1, le=32)
    worker_poll_seconds: float = Field(default=1, ge=0.1)
    worker_lease_seconds: int = Field(default=300, ge=30)
    backend_max_attempts: int = Field(default=4, ge=1, le=10)
    backend_timeout_seconds: float = Field(default=180, ge=1)
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    admin_credit_grants_enabled: bool = False
    billing_enabled: bool = False
    razorpay_api_base_url: AnyHttpUrl = AnyHttpUrl("https://api.razorpay.com/v1")
    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None
    razorpay_webhook_secret: str | None = None
    razorpay_plan_creator_id: str | None = None
    razorpay_plan_pro_id: str | None = None
    razorpay_plan_business_id: str | None = None
    razorpay_plan_creator_usd_id: str | None = None
    razorpay_plan_pro_usd_id: str | None = None
    razorpay_plan_business_usd_id: str | None = None
    razorpay_subscription_total_count: int = Field(default=1200, ge=1, le=1200)
    checkout_brand: str = "Pixtall by AI Vatika"
    gst_rate_bps: int = Field(default=1800, ge=0, le=10000)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def smtp_configured(self) -> bool:
        return bool(
            self.smtp_host
            and self.smtp_username
            and self.smtp_password
            and self.smtp_from_email
        )

    @field_validator("database_url", mode="before")
    @classmethod
    def select_psycopg_driver(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)
        return value

    @model_validator(mode="after")
    def secure_production_auth(self) -> "Settings":
        if self.app_env == "production" and self.auth_mode == "development":
            raise ValueError("AUTH_MODE=development is forbidden in production")
        if (
            self.app_env == "production"
            and self.auth_mode == "custom"
            and self.jwt_secret == "change_me_in_production"
        ):
            raise ValueError("Custom authentication requires a secure JWT_SECRET in production")
        if self.billing_enabled and not (
            self.razorpay_key_id
            and self.razorpay_key_secret
            and self.razorpay_webhook_secret
            and self.razorpay_plan_creator_id
            and self.razorpay_plan_pro_id
            and self.razorpay_plan_business_id
        ):
            raise ValueError("Billing requires Razorpay keys, webhook secret, and plan IDs")
        return self

    @property
    def razorpay_plan_ids(self) -> dict[str, str]:
        return {
            code: plan_id
            for code, plan_id in {
                "creator": self.razorpay_plan_creator_id,
                "pro": self.razorpay_plan_pro_id,
                "business": self.razorpay_plan_business_id,
            }.items()
            if plan_id
        }

    @property
    def razorpay_usd_plan_ids(self) -> dict[str, str]:
        return {
            code: plan_id
            for code, plan_id in {
                "creator": self.razorpay_plan_creator_usd_id,
                "pro": self.razorpay_plan_pro_usd_id,
                "business": self.razorpay_plan_business_usd_id,
            }.items()
            if plan_id
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()


class Base(DeclarativeBase):
    pass


settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionFactory = sessionmaker(bind=engine, expire_on_commit=False)


def get_session() -> Generator[Session, None, None]:
    with SessionFactory() as session:
        yield session


class ImageQuality(StrEnum):
    STANDARD = "standard"
    PREMIUM = "premium"


class JobStatus(StrEnum):
    QUEUED = "queued"
    PROCESSING = "processing"
    RETRYING = "retrying"
    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    FAILED = "failed"


class TransactionType(StrEnum):
    GRANTED = "granted"
    PURCHASED = "purchased"
    RESERVED = "reserved"
    USED = "used"
    RELEASED = "released"
    EXPIRED = "expired"
    REFUNDED = "refunded"


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str | None] = mapped_column(String(320), unique=True)
    name: Mapped[str | None] = mapped_column(String(200))
    hashed_password: Mapped[str | None] = mapped_column(String(200))
    auth_version: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    wallet: Mapped["Wallet"] = relationship(back_populates="user", uselist=False)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )


class SignupVerification(Base):
    __tablename__ = "signup_verifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(200))
    hashed_password: Mapped[str] = mapped_column(String(200))
    code_hash: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    base_price_paise: Mapped[int] = mapped_column(BigInteger)
    base_price_usd_cents: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    included_credits: Mapped[int] = mapped_column(Integer)
    standard_image_credits: Mapped[int] = mapped_column(Integer)
    premium_image_credits: Mapped[int] = mapped_column(Integer)
    recurring: Mapped[bool]
    active: Mapped[bool] = mapped_column(default=True)


class Subscription(Base):
    __tablename__ = "subscriptions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plans.id"))
    status: Mapped[str] = mapped_column(String(30))
    payment_id: Mapped[str | None] = mapped_column(String(200))
    payment_status: Mapped[str | None] = mapped_column(String(30))
    base_amount_paise: Mapped[int] = mapped_column(BigInteger, default=0)
    gst_amount_paise: Mapped[int] = mapped_column(BigInteger, default=0)
    total_amount_paise: Mapped[int] = mapped_column(BigInteger, default=0)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    renews_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    provider_subscription_id: Mapped[str | None] = mapped_column(
        String(200), unique=True, index=True
    )
    provider_plan_id: Mapped[str | None] = mapped_column(String(200))
    current_period_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False)
    paid_cycle_reference: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Wallet(Base):
    __tablename__ = "wallets"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    available_credits: Mapped[int] = mapped_column(Integer, default=0)
    reserved_credits: Mapped[int] = mapped_column(Integer, default=0)
    lifetime_consumed_credits: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    user: Mapped[User] = relationship(back_populates="wallet")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"
    __table_args__ = (
        UniqueConstraint("user_id", "idempotency_key"),
        Index("ix_jobs_claim", "status", "available_at", "created_at"),
    )
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    idempotency_key: Mapped[str] = mapped_column(String(200))
    quality: Mapped[ImageQuality] = mapped_column(
        Enum(
            ImageQuality,
            name="image_quality",
            values_callable=lambda members: [member.value for member in members],
        )
    )
    image_count: Mapped[int] = mapped_column(Integer)
    credit_cost: Mapped[int] = mapped_column(Integer)
    reserved_credits: Mapped[int] = mapped_column(Integer)
    consumed_credits: Mapped[int] = mapped_column(Integer, default=0)
    released_credits: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[JobStatus] = mapped_column(
        Enum(
            JobStatus,
            name="job_status",
            values_callable=lambda members: [member.value for member in members],
        ),
        default=JobStatus.QUEUED,
    )
    request_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    backend_request_id: Mapped[str | None] = mapped_column(String(200))
    error_code: Mapped[str | None] = mapped_column(String(80))
    safe_error: Mapped[str | None] = mapped_column(Text)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    available_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    lease_owner: Mapped[str | None] = mapped_column(String(200))
    lease_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    outputs: Mapped[list["GenerationOutput"]] = relationship(
        order_by="GenerationOutput.output_index"
    )


class GenerationOutput(Base):
    __tablename__ = "generation_outputs"
    __table_args__ = (UniqueConstraint("job_id", "output_index"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("generation_jobs.id", ondelete="CASCADE"), index=True
    )
    output_index: Mapped[int] = mapped_column(Integer)
    result_reference: Mapped[str | None] = mapped_column(Text)
    error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    __table_args__ = (UniqueConstraint("job_id", "type"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("generation_jobs.id"), index=True
    )
    grant_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("credit_grants.id"), index=True)
    external_reference: Mapped[str | None] = mapped_column(String(200), index=True)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType, name="transaction_type"))
    credits: Mapped[int] = mapped_column(Integer)
    available_balance_after: Mapped[int] = mapped_column(Integer)
    reserved_balance_after: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class BillingPayment(Base):
    __tablename__ = "billing_payments"
    __table_args__ = (UniqueConstraint("user_id", "idempotency_key"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plans.id"), index=True)
    idempotency_key: Mapped[str] = mapped_column(String(200))
    kind: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30), default="created", index=True)
    provider_order_id: Mapped[str | None] = mapped_column(String(200), unique=True)
    provider_subscription_id: Mapped[str | None] = mapped_column(String(200), index=True)
    provider_payment_id: Mapped[str | None] = mapped_column(String(200), unique=True)
    provider_invoice_id: Mapped[str | None] = mapped_column(String(200), unique=True)
    base_amount_paise: Mapped[int] = mapped_column(BigInteger)
    gst_amount_paise: Mapped[int] = mapped_column(BigInteger)
    total_amount_paise: Mapped[int] = mapped_column(BigInteger)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    refunded_amount_paise: Mapped[int] = mapped_column(BigInteger, default=0)
    failure_reason: Mapped[str | None] = mapped_column(Text)
    review_required: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_event_id: Mapped[str] = mapped_column(String(200), unique=True)
    event_type: Mapped[str] = mapped_column(String(100), index=True)
    status: Mapped[str] = mapped_column(String(30), default="received")
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CreditGrant(Base):
    __tablename__ = "credit_grants"
    __table_args__ = (
        CheckConstraint("available_credits >= 0", name="ck_grant_available_nonnegative"),
        CheckConstraint("reserved_credits >= 0", name="ck_grant_reserved_nonnegative"),
        CheckConstraint("consumed_credits >= 0", name="ck_grant_consumed_nonnegative"),
        CheckConstraint("expired_credits >= 0", name="ck_grant_expired_nonnegative"),
        CheckConstraint("refunded_credits >= 0", name="ck_grant_refunded_nonnegative"),
    )
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plans.id"), index=True)
    billing_payment_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("billing_payments.id"), index=True
    )
    source_type: Mapped[str] = mapped_column(String(30))
    provider_reference: Mapped[str] = mapped_column(String(200), unique=True)
    granted_credits: Mapped[int] = mapped_column(Integer)
    available_credits: Mapped[int] = mapped_column(Integer)
    reserved_credits: Mapped[int] = mapped_column(Integer, default=0)
    consumed_credits: Mapped[int] = mapped_column(Integer, default=0)
    expired_credits: Mapped[int] = mapped_column(Integer, default=0)
    refunded_credits: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="active", index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class CreditAllocation(Base):
    __tablename__ = "credit_allocations"
    __table_args__ = (UniqueConstraint("grant_id", "job_id"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("credit_grants.id"), index=True)
    job_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("generation_jobs.id"), index=True)
    reserved_credits: Mapped[int] = mapped_column(Integer)
    consumed_credits: Mapped[int] = mapped_column(Integer, default=0)
    released_credits: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class GenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_image_base64: str = Field(min_length=1, max_length=15_000_000)
    model_image_base64: str | None = Field(default=None, max_length=15_000_000)
    product_category: str = Field(min_length=1, max_length=80)
    product_subcategory: str = Field(min_length=1, max_length=80)
    scene: str = Field(min_length=1, max_length=80)
    size: Literal["9:16", "3:4", "1:1", "4:5", "16:9"]
    model: Literal["male", "female", "none"]
    intended_use: Literal["marketplace", "website"]
    image_count: int = Field(ge=1, le=4)
    quality: ImageQuality


class OutputResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    output_index: int
    result_reference: str | None
    error: str | None


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUIDValue
    status: JobStatus
    quality: ImageQuality
    image_count: int
    credit_cost: int
    reserved_credits: int
    consumed_credits: int
    released_credits: int
    attempt_count: int
    safe_error: str | None
    created_at: datetime
    updated_at: datetime
    outputs: list[OutputResponse] = Field(default_factory=list)


class WalletResponse(BaseModel):
    available_credits: int
    reserved_credits: int
    lifetime_consumed_credits: int


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUIDValue
    job_id: UUIDValue | None
    type: TransactionType
    credits: int
    available_balance_after: int
    reserved_balance_after: int
    created_at: datetime


class TransactionPage(BaseModel):
    items: list[TransactionResponse]
    limit: int
    offset: int


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


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


def _wallet_for_update(session: Session, user_id: UUIDValue) -> Wallet:
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == user_id).with_for_update())
    if wallet is None:
        raise MissingWallet("Wallet not found")
    return wallet


def grant_signup_trial(session: Session, user: User) -> None:
    """Create a new account's wallet and one-time trial in the signup transaction."""
    plan = session.scalar(select(Plan).where(Plan.code == "payg", Plan.active.is_(True)))
    if plan is None:
        raise MissingPlan("An active payg plan is required for signup trial credits")
    wallet = Wallet(
        user=user, available_credits=20, reserved_credits=0, lifetime_consumed_credits=0
    )
    grant = CreditGrant(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=plan.id,
        source_type="signup_trial",
        provider_reference=f"signup-trial:{user.id}",
        granted_credits=20,
        available_credits=20,
        # The existing schema requires an expiry; trial credits do not expire in practice.
        expires_at=datetime(9999, 12, 31, tzinfo=UTC),
    )
    session.add(wallet)
    session.flush()
    session.add(grant)
    session.flush()
    _ledger(
        session,
        user_id=user.id,
        job_id=None,
        kind=TransactionType.GRANTED,
        credits=20,
        wallet=wallet,
        grant_id=grant.id,
        external_reference=grant.provider_reference,
    )


def _ledger(
    session: Session,
    *,
    user_id: UUIDValue,
    job_id: UUIDValue | None,
    kind: TransactionType,
    credits: int,
    wallet: Wallet,
    grant_id: UUIDValue | None = None,
    external_reference: str | None = None,
) -> None:
    session.add(
        CreditTransaction(
            user_id=user_id,
            job_id=job_id,
            grant_id=grant_id,
            external_reference=external_reference,
            type=kind,
            credits=credits,
            available_balance_after=wallet.available_credits,
            reserved_balance_after=wallet.reserved_credits,
        )
    )


def expire_credit_grants(
    session: Session,
    *,
    user_id: UUIDValue,
    wallet: Wallet | None = None,
    now: datetime | None = None,
) -> int:
    """Expire only unreserved credits; reservations remain valid until job settlement."""
    moment = now or datetime.now(UTC)
    locked_wallet = wallet or _wallet_for_update(session, user_id)
    grants = list(
        session.scalars(
            select(CreditGrant)
            .where(
                CreditGrant.user_id == user_id,
                CreditGrant.available_credits > 0,
                CreditGrant.expires_at <= moment,
            )
            .order_by(CreditGrant.expires_at, CreditGrant.created_at)
            .with_for_update()
        )
    )
    expired_total = 0
    for grant in grants:
        expired = grant.available_credits
        grant.available_credits = 0
        grant.expired_credits += expired
        expired_total += expired
        locked_wallet.available_credits -= expired
        if grant.reserved_credits == 0:
            grant.status = "expired"
        _ledger(
            session,
            user_id=user_id,
            job_id=None,
            grant_id=grant.id,
            external_reference=f"expiry:{grant.id}",
            kind=TransactionType.EXPIRED,
            credits=expired,
            wallet=locked_wallet,
        )
    return expired_total


def _pricing_plan(session: Session, user_id: UUIDValue, now: datetime) -> Plan:
    plan = session.scalar(
        select(Plan)
        .join(CreditGrant, CreditGrant.plan_id == Plan.id)
        .where(
            CreditGrant.user_id == user_id,
            CreditGrant.available_credits > 0,
            CreditGrant.expires_at > now,
            Plan.active.is_(True),
        )
        .order_by(Plan.recurring.desc(), CreditGrant.expires_at)
        .limit(1)
    )
    if plan is None:
        raise MissingPlan("Valid credits are required")
    return plan


def _reserve_credit_grants(
    session: Session,
    *,
    user_id: UUIDValue,
    job_id: UUIDValue,
    credits: int,
    now: datetime,
) -> None:
    grants = list(
        session.scalars(
            select(CreditGrant)
            .where(
                CreditGrant.user_id == user_id,
                CreditGrant.available_credits > 0,
                CreditGrant.expires_at > now,
                CreditGrant.status == "active",
            )
            .order_by(CreditGrant.expires_at, CreditGrant.created_at)
            .with_for_update()
        )
    )
    remaining = credits
    for grant in grants:
        if remaining == 0:
            break
        reserved = min(grant.available_credits, remaining)
        grant.available_credits -= reserved
        grant.reserved_credits += reserved
        session.add(
            CreditAllocation(
                grant_id=grant.id,
                job_id=job_id,
                reserved_credits=reserved,
            )
        )
        remaining -= reserved
    if remaining:
        raise InsufficientCredits(f"Generation requires {credits} unexpired credits")


def submit_job(
    session: Session,
    *,
    user_id: UUIDValue,
    idempotency_key: str,
    request: GenerationRequest,
) -> GenerationJob:
    existing = session.scalar(
        select(GenerationJob).where(
            GenerationJob.user_id == user_id,
            GenerationJob.idempotency_key == idempotency_key,
        )
    )
    if existing:
        return existing

    now = datetime.now(UTC)
    wallet = _wallet_for_update(session, user_id)
    expire_credit_grants(session, user_id=user_id, wallet=wallet, now=now)
    plan = _pricing_plan(session, user_id, now)
    per_image = (
        plan.standard_image_credits
        if request.quality == ImageQuality.STANDARD
        else plan.premium_image_credits
    )
    cost = per_image * request.image_count
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
    _reserve_credit_grants(
        session,
        user_id=user_id,
        job_id=job.id,
        credits=cost,
        now=now,
    )
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


def get_owned_job(session: Session, *, user_id: UUIDValue, job_id: UUIDValue) -> GenerationJob:
    job = session.scalar(
        select(GenerationJob)
        .options(selectinload(GenerationJob.outputs))
        .where(GenerationJob.id == job_id, GenerationJob.user_id == user_id)
    )
    if job is None:
        raise JobNotFound("Generation job not found")
    return job


def claim_job(
    session: Session, *, worker_id: str, lease_seconds: int
) -> GenerationJob | None:
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


def retry_job(session: Session, *, job_id: UUIDValue, delay_seconds: float, error: str) -> None:
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
    job_id: UUIDValue,
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
    allocations = list(
        session.scalars(
            select(CreditAllocation)
            .join(CreditGrant, CreditGrant.id == CreditAllocation.grant_id)
            .where(CreditAllocation.job_id == job.id)
            .order_by(CreditGrant.expires_at, CreditAllocation.created_at)
            .with_for_update()
        )
    )
    remaining_to_consume = consumed
    returned_to_wallet = 0
    expired_on_release = 0
    now = datetime.now(UTC)
    for allocation in allocations:
        grant = session.scalar(
            select(CreditGrant)
            .where(CreditGrant.id == allocation.grant_id)
            .with_for_update()
        )
        if grant is None:
            raise MissingWallet("Reserved credit grant not found")
        allocation_consumed = min(allocation.reserved_credits, remaining_to_consume)
        allocation_released = allocation.reserved_credits - allocation_consumed
        allocation.consumed_credits = allocation_consumed
        allocation.released_credits = allocation_released
        grant.reserved_credits -= allocation.reserved_credits
        grant.consumed_credits += allocation_consumed
        remaining_to_consume -= allocation_consumed
        if allocation_released:
            if grant.expires_at > now and grant.status == "active":
                grant.available_credits += allocation_released
                returned_to_wallet += allocation_released
            else:
                grant.expired_credits += allocation_released
                expired_on_release += allocation_released
        if grant.available_credits == 0 and grant.reserved_credits == 0:
            grant.status = "expired" if grant.expires_at <= now else "depleted"

    if remaining_to_consume:
        raise MissingWallet("Credit allocations do not cover the generation reservation")

    wallet.reserved_credits -= job.reserved_credits
    wallet.available_credits += returned_to_wallet
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
    if expired_on_release:
        _ledger(
            session,
            user_id=job.user_id,
            job_id=None,
            kind=TransactionType.EXPIRED,
            credits=expired_on_release,
            wallet=wallet,
            external_reference=f"job-expiry:{job.id}",
        )
    session.commit()
