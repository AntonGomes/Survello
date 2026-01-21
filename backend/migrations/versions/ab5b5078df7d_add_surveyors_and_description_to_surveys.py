"""add_surveyors_and_description_to_surveys

Revision ID: ab5b5078df7d
Revises: f41d203a4dd3
Create Date: 2026-01-21 12:00:52.417599

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ab5b5078df7d'
down_revision: Union[str, Sequence[str], None] = 'f41d203a4dd3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the survey_surveyor_links table for many-to-many relationship if it doesn't exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'survey_surveyor_links' not in inspector.get_table_names():
        op.create_table('survey_surveyor_links',
            sa.Column('survey_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('survey_id', 'user_id')
        )

    # Add description column to surveys if it doesn't exist
    columns = [col['name'] for col in inspector.get_columns('surveys')]
    if 'description' not in columns:
        op.add_column('surveys', sa.Column('description', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('surveys', 'description')
    op.drop_table('survey_surveyor_links')
