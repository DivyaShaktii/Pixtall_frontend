"""Add pending manual sign-up email verification challenges."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0006"
down_revision: str | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "signup_verifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=True),
        sa.Column("hashed_password", sa.String(length=200), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_sent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_signup_verifications_email",
        "signup_verifications",
        ["email"],
        unique=True,
    )
    op.create_index(
        "ix_signup_verifications_expires_at",
        "signup_verifications",
        ["expires_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_signup_verifications_expires_at", table_name="signup_verifications")
    op.drop_index("ix_signup_verifications_email", table_name="signup_verifications")
    op.drop_table("signup_verifications")
