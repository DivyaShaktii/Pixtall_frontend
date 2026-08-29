"""Initial credit and generation schema."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

image_quality = sa.Enum("STANDARD", "PREMIUM", name="image_quality")
job_status = sa.Enum(
    "QUEUED",
    "PROCESSING",
    "RETRYING",
    "COMPLETED",
    "PARTIALLY_COMPLETED",
    "FAILED",
    name="job_status",
)
transaction_type = sa.Enum(
    "GRANTED", "PURCHASED", "RESERVED", "USED", "RELEASED", name="transaction_type"
)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), unique=True),
        sa.Column("name", sa.String(200)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_table(
        "plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(40), unique=True, nullable=False),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("base_price_paise", sa.BigInteger, nullable=False),
        sa.Column("included_credits", sa.Integer, nullable=False),
        sa.Column("standard_image_credits", sa.Integer, nullable=False),
        sa.Column("premium_image_credits", sa.Integer, nullable=False),
        sa.Column("recurring", sa.Boolean, nullable=False),
        sa.Column("active", sa.Boolean, nullable=False),
    )
    op.create_table(
        "wallets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            unique=True,
            nullable=False,
        ),
        sa.Column("available_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("reserved_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("lifetime_consumed_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("available_credits >= 0", name="ck_wallet_available_nonnegative"),
        sa.CheckConstraint("reserved_credits >= 0", name="ck_wallet_reserved_nonnegative"),
    )
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column(
            "plan_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("plans.id"), nullable=False
        ),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("payment_id", sa.String(200)),
        sa.Column("payment_status", sa.String(30)),
        sa.Column("base_amount_paise", sa.BigInteger),
        sa.Column("gst_amount_paise", sa.BigInteger),
        sa.Column("total_amount_paise", sa.BigInteger),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("renews_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])
    op.create_table(
        "generation_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("idempotency_key", sa.String(200), nullable=False),
        sa.Column("quality", image_quality, nullable=False),
        sa.Column("image_count", sa.Integer, nullable=False),
        sa.Column("credit_cost", sa.Integer, nullable=False),
        sa.Column("reserved_credits", sa.Integer, nullable=False),
        sa.Column("consumed_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("released_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("status", job_status, server_default="QUEUED", nullable=False),
        sa.Column("request_payload", postgresql.JSONB, nullable=False),
        sa.Column("backend_request_id", sa.String(200)),
        sa.Column("error_code", sa.String(80)),
        sa.Column("safe_error", sa.Text),
        sa.Column("attempt_count", sa.Integer, server_default="0", nullable=False),
        sa.Column(
            "available_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("lease_owner", sa.String(200)),
        sa.Column("lease_expires_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("user_id", "idempotency_key"),
        sa.CheckConstraint("image_count BETWEEN 1 AND 4", name="ck_job_image_count"),
        sa.CheckConstraint("credit_cost > 0", name="ck_job_credit_cost"),
    )
    op.create_index("ix_generation_jobs_user_id", "generation_jobs", ["user_id"])
    op.create_index("ix_jobs_claim", "generation_jobs", ["status", "available_at", "created_at"])
    op.create_table(
        "generation_outputs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("generation_jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("output_index", sa.Integer, nullable=False),
        sa.Column("result_reference", sa.Text),
        sa.Column("error", sa.Text),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("job_id", "output_index"),
    )
    op.create_index("ix_generation_outputs_job_id", "generation_outputs", ["job_id"])
    op.create_table(
        "credit_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("generation_jobs.id")),
        sa.Column("type", transaction_type, nullable=False),
        sa.Column("credits", sa.Integer, nullable=False),
        sa.Column("available_balance_after", sa.Integer, nullable=False),
        sa.Column("reserved_balance_after", sa.Integer, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("job_id", "type"),
        sa.CheckConstraint("credits > 0", name="ck_transaction_credits"),
    )
    op.create_index("ix_credit_transactions_user_id", "credit_transactions", ["user_id"])
    op.create_index("ix_credit_transactions_job_id", "credit_transactions", ["job_id"])

    plans = sa.table(
        "plans",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String),
        sa.column("name", sa.String),
        sa.column("base_price_paise", sa.BigInteger),
        sa.column("included_credits", sa.Integer),
        sa.column("standard_image_credits", sa.Integer),
        sa.column("premium_image_credits", sa.Integer),
        sa.column("recurring", sa.Boolean),
        sa.column("active", sa.Boolean),
    )
    op.bulk_insert(
        plans,
        [
            {
                "id": "10000000-0000-0000-0000-000000000001",
                "code": "payg",
                "name": "Pay as you go",
                "base_price_paise": 49900,
                "included_credits": 500,
                "standard_image_credits": 10,
                "premium_image_credits": 20,
                "recurring": False,
                "active": True,
            },
            {
                "id": "10000000-0000-0000-0000-000000000002",
                "code": "creator",
                "name": "Creator",
                "base_price_paise": 99900,
                "included_credits": 1200,
                "standard_image_credits": 8,
                "premium_image_credits": 16,
                "recurring": True,
                "active": True,
            },
            {
                "id": "10000000-0000-0000-0000-000000000003",
                "code": "pro",
                "name": "Pro",
                "base_price_paise": 199900,
                "included_credits": 2600,
                "standard_image_credits": 7,
                "premium_image_credits": 14,
                "recurring": True,
                "active": True,
            },
            {
                "id": "10000000-0000-0000-0000-000000000004",
                "code": "business",
                "name": "Business",
                "base_price_paise": 399900,
                "included_credits": 6000,
                "standard_image_credits": 6,
                "premium_image_credits": 12,
                "recurring": True,
                "active": True,
            },
        ],
    )


def downgrade() -> None:
    for table in [
        "credit_transactions",
        "generation_outputs",
        "generation_jobs",
        "subscriptions",
        "wallets",
        "plans",
        "users",
    ]:
        op.drop_table(table)
    transaction_type.drop(op.get_bind())
    job_status.drop(op.get_bind())
    image_quality.drop(op.get_bind())
