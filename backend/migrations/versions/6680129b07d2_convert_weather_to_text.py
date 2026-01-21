"""convert_weather_to_text

Revision ID: 6680129b07d2
Revises: ab5b5078df7d
Create Date: 2026-01-21 12:32:42.136485

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "6680129b07d2"
down_revision: Union[str, Sequence[str], None] = "ab5b5078df7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Convert weather column from enum to text
    # PostgreSQL will cast enum values to text automatically
    op.execute("""
        ALTER TABLE surveys 
        ALTER COLUMN weather TYPE TEXT 
        USING weather::TEXT
    """)

    # Drop the enum type since it's no longer used
    op.execute("DROP TYPE IF EXISTS weathercondition")


def downgrade() -> None:
    """Downgrade schema."""
    # Re-create the enum type
    op.execute("""
        CREATE TYPE weathercondition AS ENUM (
            'sunny', 'partly_cloudy', 'cloudy', 'overcast', 
            'light_rain', 'rain', 'heavy_rain', 'showers', 
            'drizzle', 'thunderstorm', 'snow', 'sleet', 
            'hail', 'fog', 'mist', 'windy', 'clear', 
            'frost', 'hot', 'cold'
        )
    """)
    # Convert back - note: this may fail if there are values not in the enum
    op.execute("""
        ALTER TABLE surveys 
        ALTER COLUMN weather TYPE weathercondition 
        USING weather::weathercondition
    """)
