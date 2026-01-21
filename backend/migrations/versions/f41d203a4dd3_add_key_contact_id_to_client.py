"""add_key_contact_id_to_client

Revision ID: f41d203a4dd3
Revises: 3fc35cccc84c
Create Date: 2026-01-21 11:56:13.007392

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f41d203a4dd3'
down_revision: Union[str, Sequence[str], None] = '3fc35cccc84c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('clients', sa.Column('key_contact_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_clients_key_contact_id', 'clients', 'client_contacts', ['key_contact_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_clients_key_contact_id', 'clients', type_='foreignkey')
    op.drop_column('clients', 'key_contact_id')
