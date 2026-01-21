"""merge_heads

Revision ID: b17eefecfdde
Revises: c7f82d3e4a19, ccda9121a34e
Create Date: 2026-01-20 14:53:15.079981

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "b17eefecfdde"
down_revision: Union[str, Sequence[str], None] = ("c7f82d3e4a19", "ccda9121a34e")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
