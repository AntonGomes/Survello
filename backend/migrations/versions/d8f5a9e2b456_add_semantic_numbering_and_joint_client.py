"""add_semantic_numbering_and_joint_client

Revision ID: d8f5a9e2b456
Revises: b94ebbf21a8e
Create Date: 2026-01-28 10:00:00.000000

This migration:
1. Adds job_number to jobs table for semantic job numbering (e.g., JOB-00042)
2. Adds instruction_number to projects (instructions) table for semantic instruction numbering
3. Adds is_joint and secondary_client_id to jobs table for joint client support
4. Backfills existing records with sequential numbers
5. Creates indexes on number fields
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d8f5a9e2b456"
down_revision: Union[str, Sequence[str], None] = "b94ebbf21a8e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Check existing columns
    job_columns = [col["name"] for col in inspector.get_columns("jobs")]
    project_columns = [col["name"] for col in inspector.get_columns("projects")]

    # 1. Add job_number to jobs table
    if "job_number" not in job_columns:
        op.add_column(
            "jobs", sa.Column("job_number", sa.String(32), nullable=True)
        )
        op.create_index("ix_jobs_job_number", "jobs", ["job_number"])

    # 2. Add is_joint to jobs table
    if "is_joint" not in job_columns:
        op.add_column(
            "jobs", sa.Column("is_joint", sa.Boolean(), nullable=False, server_default="false")
        )

    # 3. Add secondary_client_id to jobs table
    if "secondary_client_id" not in job_columns:
        op.add_column(
            "jobs", sa.Column("secondary_client_id", sa.Integer(), nullable=True)
        )
        op.create_foreign_key(
            "fk_jobs_secondary_client_id",
            "jobs",
            "clients",
            ["secondary_client_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # 4. Add instruction_number to projects (instructions) table
    if "instruction_number" not in project_columns:
        op.add_column(
            "projects", sa.Column("instruction_number", sa.String(32), nullable=True)
        )
        op.create_index("ix_projects_instruction_number", "projects", ["instruction_number"])

    # 5. Backfill existing job numbers
    # Get all jobs ordered by id, grouped by org_id
    connection = op.get_bind()
    
    # Backfill job_number for existing jobs
    result = connection.execute(
        sa.text("""
            SELECT id, org_id FROM jobs 
            WHERE job_number IS NULL 
            ORDER BY org_id, id
        """)
    )
    jobs = result.fetchall()
    
    # Group by org and assign sequential numbers
    org_job_counts: dict[int, int] = {}
    for job_id, org_id in jobs:
        org_job_counts[org_id] = org_job_counts.get(org_id, 0) + 1
        job_number = f"JOB-{org_job_counts[org_id]:05d}"
        connection.execute(
            sa.text("UPDATE jobs SET job_number = :job_number WHERE id = :id"),
            {"job_number": job_number, "id": job_id}
        )

    # Backfill instruction_number for existing instructions
    result = connection.execute(
        sa.text("""
            SELECT id, org_id FROM projects 
            WHERE instruction_number IS NULL 
            ORDER BY org_id, id
        """)
    )
    instructions = result.fetchall()
    
    # Group by org and assign sequential numbers
    org_instruction_counts: dict[int, int] = {}
    for instruction_id, org_id in instructions:
        org_instruction_counts[org_id] = org_instruction_counts.get(org_id, 0) + 1
        instruction_number = f"INS-{org_instruction_counts[org_id]:05d}"
        connection.execute(
            sa.text("UPDATE projects SET instruction_number = :instruction_number WHERE id = :id"),
            {"instruction_number": instruction_number, "id": instruction_id}
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Check existing columns
    job_columns = [col["name"] for col in inspector.get_columns("jobs")]
    project_columns = [col["name"] for col in inspector.get_columns("projects")]

    # Remove instruction_number from projects
    if "instruction_number" in project_columns:
        op.drop_index("ix_projects_instruction_number", table_name="projects")
        op.drop_column("projects", "instruction_number")

    # Remove secondary_client_id from jobs
    if "secondary_client_id" in job_columns:
        op.drop_constraint("fk_jobs_secondary_client_id", "jobs", type_="foreignkey")
        op.drop_column("jobs", "secondary_client_id")

    # Remove is_joint from jobs
    if "is_joint" in job_columns:
        op.drop_column("jobs", "is_joint")

    # Remove job_number from jobs
    if "job_number" in job_columns:
        op.drop_index("ix_jobs_job_number", table_name="jobs")
        op.drop_column("jobs", "job_number")
