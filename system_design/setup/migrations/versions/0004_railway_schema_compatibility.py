"""Make the credit service coexist safely with the existing Railway schema."""

from collections.abc import Sequence

from alembic import op

revision: str = "0004"
down_revision: str | None = "6214478ad017"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # The Railway database already had a project-oriented generation_jobs table.
    # Credit-service jobs do not require a legacy project row.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'generation_jobs'
                  AND column_name = 'project_id'
            ) THEN
                ALTER TABLE generation_jobs ALTER COLUMN project_id DROP NOT NULL;
            END IF;
        END $$;
        """
    )

    op.execute("UPDATE subscriptions SET base_amount_paise = 0 WHERE base_amount_paise IS NULL")
    op.execute("UPDATE subscriptions SET gst_amount_paise = 0 WHERE gst_amount_paise IS NULL")
    op.execute("UPDATE subscriptions SET total_amount_paise = 0 WHERE total_amount_paise IS NULL")
    for column in ("base_amount_paise", "gst_amount_paise", "total_amount_paise"):
        op.execute(f"ALTER TABLE subscriptions ALTER COLUMN {column} SET DEFAULT 0")
        op.execute(f"ALTER TABLE subscriptions ALTER COLUMN {column} SET NOT NULL")

    # Manual pre-migration setup created equivalent indexes with different names,
    # but these business constraints were absent and are required for idempotency.
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_generation_jobs_user_idempotency
        ON generation_jobs (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_transactions_job_type
        ON credit_transactions (job_id, type)
        WHERE job_id IS NOT NULL
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_allocations_grant_job
        ON credit_allocations (grant_id, job_id)
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_payments_user_key
        ON billing_payments (user_id, idempotency_key)
        """
    )

    op.execute("ALTER TABLE credit_grants ALTER COLUMN provider_reference SET NOT NULL")
    op.execute("ALTER TABLE credit_grants ALTER COLUMN expires_at SET NOT NULL")
    for name, expression in (
        ("ck_grant_available_nonnegative", "available_credits >= 0"),
        ("ck_grant_reserved_nonnegative", "reserved_credits >= 0"),
        ("ck_grant_consumed_nonnegative", "consumed_credits >= 0"),
        ("ck_grant_expired_nonnegative", "expired_credits >= 0"),
        ("ck_grant_refunded_nonnegative", "refunded_credits >= 0"),
    ):
        op.execute(
            f"""
            DO $$ BEGIN
                ALTER TABLE credit_grants ADD CONSTRAINT {name} CHECK ({expression});
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
            """
        )


def downgrade() -> None:
    # Keep project_id nullable: credit-service rows legitimately have no legacy project.
    for name in (
        "uq_generation_jobs_user_idempotency",
        "uq_credit_transactions_job_type",
        "uq_credit_allocations_grant_job",
        "uq_billing_payments_user_key",
    ):
        op.execute(f"DROP INDEX IF EXISTS {name}")
    for name in (
        "ck_grant_available_nonnegative",
        "ck_grant_reserved_nonnegative",
        "ck_grant_consumed_nonnegative",
        "ck_grant_expired_nonnegative",
        "ck_grant_refunded_nonnegative",
    ):
        op.execute(f"ALTER TABLE credit_grants DROP CONSTRAINT IF EXISTS {name}")
