"""add_lease_clauses_to_dilaps_runs

Revision ID: a1b2c3d4e5f6
Revises: 164cf9136460
Create Date: 2026-03-19 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "164cf9136460"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "dilaps_runs",
        sa.Column("lease_clauses", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("dilaps_runs", "lease_clauses")
