"""expand_survey_model

Revision ID: 4a3b4f8041cb
Revises: ea097f5c83ae
Create Date: 2026-01-20 16:00:58.123933

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4a3b4f8041cb"
down_revision: Union[str, Sequence[str], None] = "ea097f5c83ae"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Expand survey model with new fields."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("surveys")]

    # Rename 'date' to 'conducted_date' for clarity (only if 'date' exists and 'conducted_date' doesn't)
    if "date" in columns and "conducted_date" not in columns:
        op.alter_column("surveys", "date", new_column_name="conducted_date")

    # Add new columns only if they don't exist
    if "conducted_time" not in columns:
        op.add_column("surveys", sa.Column("conducted_time", sa.Time(), nullable=True))
    if "site_notes" not in columns:
        op.add_column("surveys", sa.Column("site_notes", sa.Text(), nullable=True))
    if "weather" not in columns:
        op.add_column("surveys", sa.Column("weather", sa.String(255), nullable=True))
    if "project_id" not in columns:
        op.add_column("surveys", sa.Column("project_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_surveys_project_id",
            "surveys",
            "projects",
            ["project_id"],
            ["id"],
            ondelete="SET NULL",
        )
    if "conducted_by_user_id" not in columns:
        op.add_column(
            "surveys", sa.Column("conducted_by_user_id", sa.Integer(), nullable=True)
        )
        op.create_foreign_key(
            "fk_surveys_conducted_by_user_id",
            "surveys",
            "users",
            ["conducted_by_user_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    """Remove survey model expansions."""
    # Drop foreign key constraints
    op.drop_constraint("fk_surveys_conducted_by_user_id", "surveys", type_="foreignkey")
    op.drop_constraint("fk_surveys_project_id", "surveys", type_="foreignkey")

    # Drop new columns
    op.drop_column("surveys", "conducted_by_user_id")
    op.drop_column("surveys", "project_id")
    op.drop_column("surveys", "weather")
    op.drop_column("surveys", "site_notes")
    op.drop_column("surveys", "conducted_time")

    # Rename back
    op.alter_column("surveys", "conducted_date", new_column_name="date")
