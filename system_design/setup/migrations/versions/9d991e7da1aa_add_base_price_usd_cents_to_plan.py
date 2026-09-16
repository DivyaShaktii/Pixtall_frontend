"""Add base_price_usd_cents to Plan.

Revision: 9d991e7da1aa
Revises: 0006
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "9d991e7da1aa"
down_revision: str | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "plans",
        sa.Column("base_price_usd_cents", sa.Integer(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("plans", "base_price_usd_cents")
