"""Populate the fixed USD prices for active plans.

Revision: 0007
Revises: 9d991e7da1aa
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: str | None = "9d991e7da1aa"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    prices = {
        "payg": 999,
        "creator": 1_599,
        "pro": 2_999,
        "business": 5_499,
    }
    for code, cents in prices.items():
        op.execute(
            sa.text(
                "UPDATE plans SET base_price_usd_cents = :cents WHERE code = :code"
            ).bindparams(code=code, cents=cents)
        )


def downgrade() -> None:
    op.execute(
        sa.text(
            "UPDATE plans SET base_price_usd_cents = 0 "
            "WHERE code IN ('payg', 'creator', 'pro', 'business')"
        )
    )
