"""add finalising to run status

Revision ID: 34c29e353e46
Revises: f1d57be01f20
Create Date: 2026-01-02 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '34c29e353e46'
down_revision: Union[str, Sequence[str], None] = 'f1d57be01f20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres specific command to add value to enum
    op.execute("ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'finalising'")


def downgrade() -> None:
    pass
