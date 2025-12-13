"""add_job_progress

Revision ID: b4e5f6g7h8i9
Revises: ad29e353e46c
Create Date: 2023-10-27 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b4e5f6g7h8i9"
down_revision: Union[str, Sequence[str], None] = "ad29e353e46c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("progress", sa.Integer(), nullable=True, default=0))
    op.add_column("jobs", sa.Column("logs", sa.JSON(), nullable=True, default=[]))


def downgrade() -> None:
    op.drop_column("jobs", "logs")
    op.drop_column("jobs", "progress")
