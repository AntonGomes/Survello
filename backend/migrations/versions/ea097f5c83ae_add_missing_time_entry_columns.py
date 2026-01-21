"""add_missing_time_entry_columns

Revision ID: ea097f5c83ae
Revises: 3721e4c58c19
Create Date: 2026-01-20 15:16:14.189654

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ea097f5c83ae"
down_revision: Union[str, Sequence[str], None] = "3721e4c58c19"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing columns to time_entries table."""
    op.add_column(
        "time_entries", sa.Column("duration_minutes", sa.Integer(), nullable=True)
    )
    op.add_column("time_entries", sa.Column("update_id", sa.String(), nullable=True))


def downgrade() -> None:
    """Remove added columns from time_entries table."""
    op.drop_column("time_entries", "update_id")
    op.drop_column("time_entries", "duration_minutes")
