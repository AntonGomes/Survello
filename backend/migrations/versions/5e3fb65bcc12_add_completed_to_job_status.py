"""add completed to job_status

Revision ID: 5e3fb65bcc12
Revises: 233f13d762f7
Create Date: 2025-12-12 13:14:15.343545

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "5e3fb65bcc12"
down_revision: Union[str, Sequence[str], None] = "233f13d762f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'completed'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
