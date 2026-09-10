"""Update plan pricing and image credit costs."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

plans = sa.table(
    "plans",
    sa.column("code", sa.String),
    sa.column("name", sa.String),
    sa.column("base_price_paise", sa.BigInteger),
    sa.column("included_credits", sa.Integer),
    sa.column("standard_image_credits", sa.Integer),
    sa.column("premium_image_credits", sa.Integer),
)

UPDATED_PLANS = {
    "payg": ("Pay as You Go", 49_900, 420, 10, 30),
    "creator": ("Creator", 99_900, 1_000, 10, 30),
    "pro": ("Pro", 199_900, 2_200, 10, 30),
    "business": ("Business", 399_900, 4_800, 10, 30),
}

PREVIOUS_PLANS = {
    "payg": ("Pay as you go", 49_900, 500, 10, 20),
    "creator": ("Creator", 99_900, 1_200, 8, 16),
    "pro": ("Pro", 199_900, 2_600, 7, 14),
    "business": ("Business", 399_900, 6_000, 6, 12),
}


def update_plans(values: dict[str, tuple[str, int, int, int, int]]) -> None:
    connection = op.get_bind()
    for code, (name, price, credits, standard_cost, premium_cost) in values.items():
        connection.execute(
            plans.update()
            .where(plans.c.code == code)
            .values(
                name=name,
                base_price_paise=price,
                included_credits=credits,
                standard_image_credits=standard_cost,
                premium_image_credits=premium_cost,
            )
        )


def upgrade() -> None:
    update_plans(UPDATED_PLANS)


def downgrade() -> None:
    update_plans(PREVIOUS_PLANS)
