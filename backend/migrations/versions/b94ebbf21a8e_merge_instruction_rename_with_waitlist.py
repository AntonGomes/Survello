"""merge_instruction_rename_with_waitlist

Revision ID: b94ebbf21a8e
Revises: d2f4a8e6b123, rename_project_to_instruction
Create Date: 2026-01-27 17:45:38.236925

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b94ebbf21a8e'
down_revision: Union[str, Sequence[str], None] = ('d2f4a8e6b123', 'rename_project_to_instruction')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
