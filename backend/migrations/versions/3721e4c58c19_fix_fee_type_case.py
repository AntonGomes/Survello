"""fix_fee_type_case

Revision ID: 3721e4c58c19
Revises: b17eefecfdde
Create Date: 2026-01-20 14:53:29.737682

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "3721e4c58c19"
down_revision: Union[str, Sequence[str], None] = "b17eefecfdde"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert uppercase feetype PostgreSQL enum values to lowercase to match Python FeeType enum."""
    # Create new enum type with lowercase values
    op.execute("CREATE TYPE feetype_new AS ENUM ('fixed', 'hourly', 'mixed')")

    # Change the projects column to use the new enum type, mapping old values to new
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN fee_type TYPE feetype_new 
        USING (LOWER(fee_type::text)::feetype_new)
    """)

    # Change the project_types column to use the new enum type, mapping old values to new
    op.execute("""
        ALTER TABLE project_types 
        ALTER COLUMN default_fee_type TYPE feetype_new 
        USING (LOWER(default_fee_type::text)::feetype_new)
    """)

    # Drop the old enum type
    op.execute("DROP TYPE feetype")

    # Rename the new enum to the original name
    op.execute("ALTER TYPE feetype_new RENAME TO feetype")


def downgrade() -> None:
    """Convert lowercase feetype PostgreSQL enum values back to uppercase."""
    # Create old enum type with uppercase values
    op.execute("CREATE TYPE feetype_old AS ENUM ('FIXED', 'HOURLY', 'MIXED')")

    # Change the projects column to use the old enum type, mapping values to uppercase
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN fee_type TYPE feetype_old 
        USING (UPPER(fee_type::text)::feetype_old)
    """)

    # Change the project_types column to use the old enum type, mapping values to uppercase
    op.execute("""
        ALTER TABLE project_types 
        ALTER COLUMN default_fee_type TYPE feetype_old 
        USING (UPPER(default_fee_type::text)::feetype_old)
    """)

    # Drop the new enum type
    op.execute("DROP TYPE feetype")

    # Rename the old enum back to the original name
    op.execute("ALTER TYPE feetype_old RENAME TO feetype")
