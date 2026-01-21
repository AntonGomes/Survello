"""add_template_to_project_type

Revision ID: 3fc35cccc84c
Revises: 4a3b4f8041cb
Create Date: 2026-01-20 23:38:57.461201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '3fc35cccc84c'
down_revision: Union[str, Sequence[str], None] = '4a3b4f8041cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('project_types', sa.Column('default_template_file_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_project_types_template_file', 
        'project_types', 
        'files', 
        ['default_template_file_id'], 
        ['id'], 
        ondelete='SET NULL'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_project_types_template_file', 'project_types', type_='foreignkey')
    op.drop_column('project_types', 'default_template_file_id')
