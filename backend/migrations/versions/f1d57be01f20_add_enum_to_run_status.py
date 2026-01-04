"""Add enum to run status

Revision ID: f1d57be01f20
Revises: adc0f355fd05
Create Date: 2026-01-02 15:27:53.761140

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'f1d57be01f20'
down_revision: Union[str, Sequence[str], None] = 'adc0f355fd05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Alembic does not automatically detect changes to Enum values.
    # We must manually add the new value to the Postgres type.
    # We use a transaction-safe block (if supported) or just execute.
    # 'IF NOT EXISTS' prevents errors if it was already added.
    op.execute("ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'presigning'")


def downgrade() -> None:
    """Downgrade schema."""
    # Postgres does not support removing values from an ENUM type easily.
    # Usually, we leave it or would have to recreate the type.
    pass
