"""Add Razorpay billing records and expiring credit grants."""

from collections.abc import Sequence
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import sqlalchemy as sa
from alembic import context, op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'EXPIRED'")
    op.execute("ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'REFUNDED'")

    op.add_column("subscriptions", sa.Column("provider_subscription_id", sa.String(200)))
    op.add_column("subscriptions", sa.Column("provider_plan_id", sa.String(200)))
    op.add_column("subscriptions", sa.Column("current_period_start", sa.DateTime(timezone=True)))
    op.add_column("subscriptions", sa.Column("current_period_end", sa.DateTime(timezone=True)))
    op.add_column(
        "subscriptions",
        sa.Column("cancel_at_period_end", sa.Boolean, server_default=sa.false(), nullable=False),
    )
    op.add_column("subscriptions", sa.Column("paid_cycle_reference", sa.String(200)))
    op.create_index(
        "ix_subscriptions_provider_subscription_id",
        "subscriptions",
        ["provider_subscription_id"],
        unique=True,
    )

    op.create_table(
        "billing_payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("plans.id"), nullable=False),
        sa.Column("idempotency_key", sa.String(200), nullable=False),
        sa.Column("kind", sa.String(30), nullable=False),
        sa.Column("status", sa.String(30), server_default="created", nullable=False),
        sa.Column("provider_order_id", sa.String(200), unique=True),
        sa.Column("provider_subscription_id", sa.String(200)),
        sa.Column("provider_payment_id", sa.String(200), unique=True),
        sa.Column("provider_invoice_id", sa.String(200), unique=True),
        sa.Column("base_amount_paise", sa.BigInteger, nullable=False),
        sa.Column("gst_amount_paise", sa.BigInteger, nullable=False),
        sa.Column("total_amount_paise", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.String(3), server_default="INR", nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True)),
        sa.Column("refunded_amount_paise", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("failure_reason", sa.Text),
        sa.Column("review_required", sa.Boolean, server_default=sa.false(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "idempotency_key", name="uq_billing_payment_user_key"),
    )
    op.create_index("ix_billing_payments_user_id", "billing_payments", ["user_id"])
    op.create_index("ix_billing_payments_plan_id", "billing_payments", ["plan_id"])
    op.create_index("ix_billing_payments_status", "billing_payments", ["status"])
    op.create_index(
        "ix_billing_payments_provider_subscription_id",
        "billing_payments",
        ["provider_subscription_id"],
    )

    op.create_table(
        "webhook_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("provider_event_id", sa.String(200), unique=True, nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("status", sa.String(30), server_default="received", nullable=False),
        sa.Column("payload", postgresql.JSONB, nullable=False),
        sa.Column("error", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_webhook_events_event_type", "webhook_events", ["event_type"])

    op.create_table(
        "credit_grants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("plans.id"), nullable=False),
        sa.Column(
            "billing_payment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("billing_payments.id"),
        ),
        sa.Column("source_type", sa.String(30), nullable=False),
        sa.Column("provider_reference", sa.String(200), unique=True, nullable=False),
        sa.Column("granted_credits", sa.Integer, nullable=False),
        sa.Column("available_credits", sa.Integer, nullable=False),
        sa.Column("reserved_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("consumed_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("expired_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("refunded_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("status", sa.String(30), server_default="active", nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("available_credits >= 0", name="ck_grant_available_nonnegative"),
        sa.CheckConstraint("reserved_credits >= 0", name="ck_grant_reserved_nonnegative"),
        sa.CheckConstraint("consumed_credits >= 0", name="ck_grant_consumed_nonnegative"),
        sa.CheckConstraint("expired_credits >= 0", name="ck_grant_expired_nonnegative"),
        sa.CheckConstraint("refunded_credits >= 0", name="ck_grant_refunded_nonnegative"),
    )
    op.create_index("ix_credit_grants_user_id", "credit_grants", ["user_id"])
    op.create_index("ix_credit_grants_plan_id", "credit_grants", ["plan_id"])
    op.create_index("ix_credit_grants_billing_payment_id", "credit_grants", ["billing_payment_id"])
    op.create_index("ix_credit_grants_status", "credit_grants", ["status"])
    op.create_index("ix_credit_grants_expires_at", "credit_grants", ["expires_at"])

    op.create_table(
        "credit_allocations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("grant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("credit_grants.id"), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("generation_jobs.id"), nullable=False),
        sa.Column("reserved_credits", sa.Integer, nullable=False),
        sa.Column("consumed_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("released_credits", sa.Integer, server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("grant_id", "job_id", name="uq_credit_allocation_grant_job"),
    )
    op.create_index("ix_credit_allocations_grant_id", "credit_allocations", ["grant_id"])
    op.create_index("ix_credit_allocations_job_id", "credit_allocations", ["job_id"])

    op.add_column(
        "credit_transactions",
        sa.Column("grant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("credit_grants.id")),
    )
    op.add_column("credit_transactions", sa.Column("external_reference", sa.String(200)))
    op.create_index("ix_credit_transactions_grant_id", "credit_transactions", ["grant_id"])
    op.create_index(
        "ix_credit_transactions_external_reference",
        "credit_transactions",
        ["external_reference"],
    )

    # Data-dependent backfill is online-only; offline SQL cannot inspect current wallets.
    if context.is_offline_mode():
        return
    connection = op.get_bind()
    wallets = connection.execute(
        sa.text(
            """
            SELECT w.user_id, w.available_credits, s.plan_id
            FROM wallets w
            JOIN LATERAL (
                SELECT plan_id FROM subscriptions
                WHERE user_id = w.user_id
                ORDER BY starts_at DESC LIMIT 1
            ) s ON true
            WHERE w.available_credits > 0
            """
        )
    ).mappings()
    legacy_expiry = datetime.now(UTC) + timedelta(days=3650)
    for row in wallets:
        connection.execute(
            sa.text(
                """
                INSERT INTO credit_grants (
                    id, user_id, plan_id, source_type, provider_reference,
                    granted_credits, available_credits, reserved_credits,
                    consumed_credits, expired_credits, refunded_credits,
                    status, expires_at
                ) VALUES (
                    :id, :user_id, :plan_id, 'legacy', :provider_reference,
                    :credits, :credits, 0, 0, 0, 0, 'active', :expires_at
                )
                """
            ),
            {
                "id": uuid4(),
                "user_id": row["user_id"],
                "plan_id": row["plan_id"],
                "provider_reference": f"legacy:{row['user_id']}",
                "credits": row["available_credits"],
                "expires_at": legacy_expiry,
            },
        )


def downgrade() -> None:
    op.drop_index("ix_credit_transactions_external_reference", table_name="credit_transactions")
    op.drop_index("ix_credit_transactions_grant_id", table_name="credit_transactions")
    op.drop_column("credit_transactions", "external_reference")
    op.drop_column("credit_transactions", "grant_id")
    op.drop_table("credit_allocations")
    op.drop_table("credit_grants")
    op.drop_table("webhook_events")
    op.drop_table("billing_payments")
    op.drop_index("ix_subscriptions_provider_subscription_id", table_name="subscriptions")
    op.drop_column("subscriptions", "paid_cycle_reference")
    op.drop_column("subscriptions", "cancel_at_period_end")
    op.drop_column("subscriptions", "current_period_end")
    op.drop_column("subscriptions", "current_period_start")
    op.drop_column("subscriptions", "provider_plan_id")
    op.drop_column("subscriptions", "provider_subscription_id")
    # PostgreSQL enum values are intentionally retained; removing them is unsafe when rolling back.
