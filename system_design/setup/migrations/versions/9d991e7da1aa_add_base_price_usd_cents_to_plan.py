"""Add base_price_usd_cents to Plan

Revision: 9d991e7da1aa
Revises: 0006
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9d991e7da1aa'
down_revision: Union[str, None] = '0006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('plans', sa.Column('base_price_usd_cents', sa.Integer(), server_default='0', nullable=False))


def downgrade() -> None:
    op.drop_column('plans', 'base_price_usd_cents')
