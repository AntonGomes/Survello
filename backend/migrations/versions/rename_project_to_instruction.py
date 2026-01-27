"""Rename project_id to instruction_id in related tables

Revision ID: rename_project_to_instruction
Revises: 
Create Date: 2026-01-27

This migration renames 'project_id' columns to 'instruction_id' in:
- time_entries
- files
- surveys

The 'projects' and 'project_types' tables remain unchanged (data stays the same).
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "rename_project_to_instruction"
down_revision = "398023069eb4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename project_id to instruction_id in time_entries
    op.alter_column(
        "time_entries",
        "project_id",
        new_column_name="instruction_id",
        existing_type=sa.INTEGER(),
        existing_nullable=False,
    )
    
    # Rename project_id to instruction_id in files
    op.alter_column(
        "files",
        "project_id",
        new_column_name="instruction_id",
        existing_type=sa.INTEGER(),
        existing_nullable=True,
    )
    
    # Rename project_id to instruction_id in surveys
    op.alter_column(
        "surveys",
        "project_id",
        new_column_name="instruction_id",
        existing_type=sa.INTEGER(),
        existing_nullable=True,
    )
    
    # Rename project_type_id to instruction_type_id in projects table
    op.alter_column(
        "projects",
        "project_type_id",
        new_column_name="instruction_type_id",
        existing_type=sa.INTEGER(),
        existing_nullable=False,
    )
    
    # Rename project_type_id to instruction_type_id in quote_lines table
    op.alter_column(
        "quote_lines",
        "project_type_id",
        new_column_name="instruction_type_id",
        existing_type=sa.INTEGER(),
        existing_nullable=False,
    )


def downgrade() -> None:
    # Rename back instruction_id to project_id in time_entries
    op.alter_column(
        "time_entries",
        "instruction_id",
        new_column_name="project_id",
        existing_type=sa.INTEGER(),
        existing_nullable=False,
    )
    
    # Rename back instruction_id to project_id in files
    op.alter_column(
        "files",
        "instruction_id",
        new_column_name="project_id",
        existing_type=sa.INTEGER(),
        existing_nullable=True,
    )
    
    # Rename back instruction_id to project_id in surveys
    op.alter_column(
        "surveys",
        "instruction_id",
        new_column_name="project_id",
        existing_type=sa.INTEGER(),
        existing_nullable=True,
    )
    
    # Rename back instruction_type_id to project_type_id in projects table
    op.alter_column(
        "projects",
        "instruction_type_id",
        new_column_name="project_type_id",
        existing_type=sa.INTEGER(),
        existing_nullable=False,
    )
    
    # Rename back instruction_type_id to project_type_id in quote_lines table
    op.alter_column(
        "quote_lines",
        "instruction_type_id",
        new_column_name="project_type_id",
        existing_type=sa.INTEGER(),
        existing_nullable=False,
    )
