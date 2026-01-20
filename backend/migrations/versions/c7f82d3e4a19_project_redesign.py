"""project_redesign

Revision ID: c7f82d3e4a19
Revises: a85f20d84b15
Create Date: 2026-01-19 10:00:00.000000

This migration:
1. Drops the tasks table (removing task granularity from projects)
2. Removes the notes column from projects (unified into updates)
3. Adds project_id to files (for project-level file attachments)
4. Adds preview_file_id to files (for PDF preview links)
5. Creates time_entries table (restoring time tracking)
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c7f82d3e4a19"
down_revision: Union[str, Sequence[str], None] = "a85f20d84b15"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Drop tasks table
    if "tasks" in existing_tables:
        op.drop_table("tasks")

    # 2. Remove notes column from projects (if exists)
    project_columns = [col["name"] for col in inspector.get_columns("projects")]
    if "notes" in project_columns:
        op.drop_column("projects", "notes")

    # 3. Add project_id to files
    file_columns = [col["name"] for col in inspector.get_columns("files")]
    if "project_id" not in file_columns:
        op.add_column(
            "files", sa.Column("project_id", sa.Integer(), nullable=True)
        )
        op.create_foreign_key(
            "fk_files_project_id",
            "files",
            "projects",
            ["project_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # 4. Add preview_file_id to files (self-referential for PDF previews)
    if "preview_file_id" not in file_columns:
        op.add_column(
            "files", sa.Column("preview_file_id", sa.Integer(), nullable=True)
        )
        op.create_foreign_key(
            "fk_files_preview_file_id",
            "files",
            "files",
            ["preview_file_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # 5. Create time_entries table
    if "time_entries" not in existing_tables:
        op.create_table(
            "time_entries",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("project_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("start_time", sa.DateTime(), nullable=False),
            sa.Column("end_time", sa.DateTime(), nullable=True),
            sa.Column("description", sa.String(), nullable=True),
            sa.Column("duration_minutes", sa.Integer(), nullable=True),
            sa.Column("update_id", sa.String(), nullable=True),  # Links to update UUID in project.updates
            sa.ForeignKeyConstraint(
                ["project_id"],
                ["projects.id"],
                name="fk_time_entries_project_id",
                ondelete="CASCADE",
            ),
            sa.ForeignKeyConstraint(
                ["user_id"],
                ["users.id"],
                name="fk_time_entries_user_id",
                ondelete="CASCADE",
            ),
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # Drop time_entries table
    if "time_entries" in existing_tables:
        op.drop_table("time_entries")

    # Remove preview_file_id from files
    file_columns = [col["name"] for col in inspector.get_columns("files")]
    if "preview_file_id" in file_columns:
        op.drop_constraint("fk_files_preview_file_id", "files", type_="foreignkey")
        op.drop_column("files", "preview_file_id")

    # Remove project_id from files
    if "project_id" in file_columns:
        op.drop_constraint("fk_files_project_id", "files", type_="foreignkey")
        op.drop_column("files", "project_id")

    # Add notes column back to projects
    project_columns = [col["name"] for col in inspector.get_columns("projects")]
    if "notes" not in project_columns:
        op.add_column(
            "projects", sa.Column("notes", sa.String(), nullable=True)
        )

    # Recreate tasks table
    if "tasks" not in existing_tables:
        op.create_table(
            "tasks",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=False, server_default="todo"),
            sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("estimated_hours", sa.Float(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("org_id", sa.Integer(), nullable=False),
            sa.Column("project_id", sa.Integer(), nullable=False),
            sa.Column("assignee_id", sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["assignee_id"], ["users.id"], ondelete="SET NULL"),
        )
