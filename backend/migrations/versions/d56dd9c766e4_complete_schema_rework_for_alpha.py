"""Complete schema rework for alpha

Revision ID: d56dd9c766e4
Revises: 9112e414fb91
Create Date: 2025-12-30 21:41:26.039714
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "d56dd9c766e4"
down_revision: Union[str, Sequence[str], None] = "9112e414fb91"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# -----------------------------
# Helpers (Postgres-specific)
# -----------------------------


def _drop_table_cascade(name: str) -> None:
    op.execute(sa.text(f'DROP TABLE IF EXISTS "{name}" CASCADE'))


def _drop_type_cascade(name: str) -> None:
    op.execute(sa.text(f'DROP TYPE IF EXISTS "{name}" CASCADE'))


def upgrade() -> None:
    bind = op.get_bind()

    # 1) Drop legacy schema (idempotent)
    _drop_table_cascade("organisation_templates")
    _drop_table_cascade("jobs")
    _drop_table_cascade("documents")
    _drop_table_cascade("users")
    _drop_table_cascade("organisations")

    # Drop old enum type if it existed previously
    _drop_type_cascade("job_status")

    # 2) Define enums as Postgres named types
    # Key point: use postgresql.ENUM + create_type=False in columns to prevent table-create from recreating them.
    user_role_enum = postgresql.ENUM("member", "admin", name="user_role")
    run_status_enum = postgresql.ENUM(
        "idle",
        "presigning",
        "uploading",
        "generating",
        "completed",
        "error",
        name="run_status",
    )
    file_role_enum = postgresql.ENUM(
        "template",
        "preview_pdf",
        "artefact",
        "input",
        name="file_role",
    )

    # Create types if missing
    user_role_enum.create(bind, checkfirst=True)
    run_status_enum.create(bind, checkfirst=True)
    file_role_enum.create(bind, checkfirst=True)

    # Column-level versions that will NOT attempt to create/drop types implicitly
    user_role_col = postgresql.ENUM(
        "member", "admin", name="user_role", create_type=False
    )
    run_status_col = postgresql.ENUM(
        "idle",
        "presigning",
        "uploading",
        "generating",
        "completed",
        "error",
        name="run_status",
        create_type=False,
    )
    file_role_col = postgresql.ENUM(
        "template",
        "preview_pdf",
        "artefact",
        "input",
        name="file_role",
        create_type=False,
    )

    # 3) Create new tables

    op.create_table(
        "orgs",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "role", user_role_col, nullable=False, server_default=sa.text("'member'")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_org_id", "users", ["org_id"])
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "clients",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_clients_org_id", "clients", ["org_id"])
    op.create_index("ix_clients_org_name", "clients", ["org_id", "name"])

    op.create_table(
        "client_contacts",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("role_title", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["client_id"], ["clients.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_client_contacts_client_id", "client_contacts", ["client_id"])

    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["client_id"], ["clients.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"], ["users.id"], ondelete="RESTRICT"
        ),
    )
    op.create_index("ix_jobs_org_id", "jobs", ["org_id"])
    op.create_index("ix_jobs_client_id", "jobs", ["client_id"])
    op.create_index("ix_jobs_created_by_user_id", "jobs", ["created_by_user_id"])
    op.create_index("ix_jobs_org_created_at", "jobs", ["org_id", "created_at"])
    op.create_index("ix_jobs_org_client", "jobs", ["org_id", "client_id"])

    op.create_table(
        "runs",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=True),
        sa.Column(
            "status", run_status_col, nullable=False, server_default=sa.text("'idle'")
        ),
        sa.Column("upload_progress", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "model_responses",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"], ["users.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_runs_org_id", "runs", ["org_id"])
    op.create_index("ix_runs_created_by_user_id", "runs", ["created_by_user_id"])
    op.create_index("ix_runs_job_id", "runs", ["job_id"])
    op.create_index("ix_runs_org_created_at", "runs", ["org_id", "created_at"])
    op.create_index("ix_runs_job_created_at", "runs", ["job_id", "created_at"])

    op.create_table(
        "files",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column("owner_user_id", sa.Integer(), nullable=False),
        sa.Column("storage_key", sa.String(length=1024), nullable=False),
        sa.Column("file_name", sa.String(length=512), nullable=False),
        sa.Column("mime_type", sa.String(length=255), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("sha256", sa.String(length=64), nullable=True),
        sa.Column(
            "role", file_role_col, nullable=False, server_default=sa.text("'input'")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("storage_key", name="uq_files_storage_key"),
    )
    op.create_index("ix_files_org_id", "files", ["org_id"])
    op.create_index("ix_files_owner_user_id", "files", ["owner_user_id"])
    op.create_index("ix_files_org_created_at", "files", ["org_id", "created_at"])
    op.create_index("ix_files_org_sha256", "files", ["org_id", "sha256"])
    op.create_index(
        "ix_files_org_role_created_at", "files", ["org_id", "role", "created_at"]
    )

    op.create_table(
        "job_files",
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("file_id", sa.Integer(), nullable=False),
        sa.Column("added_by_user_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["added_by_user_id"], ["users.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("job_id", "file_id", name="pk_job_files"),
    )
    op.create_index("ix_job_files_added_by_user_id", "job_files", ["added_by_user_id"])

    op.create_table(
        "run_files",
        sa.Column("run_id", sa.Integer(), nullable=False),
        sa.Column("file_id", sa.Integer(), nullable=False),
        sa.Column(
            "role", file_role_col, nullable=False, server_default=sa.text("'input'")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["run_id"], ["runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("run_id", "file_id", name="pk_run_files"),
    )
    op.create_index("ix_run_files_run_role", "run_files", ["run_id", "role"])

    op.create_table(
        "artefacts",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=True),
        sa.Column("run_id", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("artefact_type", sa.String(length=16), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("file_id", sa.Integer(), nullable=False),
        # must be nullable because ondelete=SET NULL
        sa.Column("preview_file_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["run_id"], ["runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["preview_file_id"], ["files.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("run_id", "version", name="uq_artefacts_run_version"),
        sa.CheckConstraint("version >= 1", name="ck_artefacts_version_positive"),
    )
    op.create_index("ix_artefacts_org_id", "artefacts", ["org_id"])
    op.create_index(
        "ix_artefacts_job_created_at", "artefacts", ["job_id", "created_at"]
    )
    op.create_index("ix_artefacts_run_version_desc", "artefacts", ["run_id", "version"])


def downgrade() -> None:
    bind = op.get_bind()

    # Drop new schema
    _drop_table_cascade("artefacts")
    _drop_table_cascade("run_files")
    _drop_table_cascade("job_files")
    _drop_table_cascade("files")
    _drop_table_cascade("runs")
    _drop_table_cascade("jobs")
    _drop_table_cascade("client_contacts")
    _drop_table_cascade("clients")
    _drop_table_cascade("users")
    _drop_table_cascade("orgs")

    # Drop new enum types (safe)
    _drop_type_cascade("file_role")
    _drop_type_cascade("run_status")
    _drop_type_cascade("user_role")

    # Recreate legacy enum type
    job_status_enum = postgresql.ENUM(
        "pending",
        "running",
        "succeeded",
        "failed",
        "completed",
        name="job_status",
    )
    job_status_enum.create(bind, checkfirst=True)

    # Recreate old tables (your original downgrade)
    op.create_table(
        "organisations",
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("name", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="organisations_pkey"),
        postgresql_ignore_search_path=False,
    )

    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("external_id", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("org_id", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column("username", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("email", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["org_id"], ["organisations.id"], name="users_org_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id", name="users_pkey"),
        sa.UniqueConstraint(
            "email",
            name="users_email_key",
            postgresql_include=[],
            postgresql_nulls_not_distinct=False,
        ),
        sa.UniqueConstraint(
            "external_id",
            name="users_external_id_key",
            postgresql_include=[],
            postgresql_nulls_not_distinct=False,
        ),
        sa.UniqueConstraint(
            "username",
            name="users_username_key",
            postgresql_include=[],
            postgresql_nulls_not_distinct=False,
        ),
        postgresql_ignore_search_path=False,
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("org_id", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column("owner_user_id", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column("name", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("file_url", sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column("mime_type", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("generation_prompt", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            "template_description", sa.TEXT(), autoincrement=False, nullable=True
        ),
        sa.Column(
            "prompt_version",
            sa.INTEGER(),
            server_default=sa.text("1"),
            autoincrement=False,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["org_id"], ["organisations.id"], name=op.f("documents_org_id_fkey")
        ),
        sa.ForeignKeyConstraint(
            ["owner_user_id"], ["users.id"], name=op.f("documents_owner_user_id_fkey")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("documents_pkey")),
    )

    op.create_table(
        "jobs",
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("org_id", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column("user_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("template_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column(
            "status",
            job_status_enum,
            server_default=sa.text("'pending'::job_status"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("error_message", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "started_at",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            "completed_at",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            "context_s3_urls",
            postgresql.JSON(astext_type=sa.Text()),
            server_default=sa.text("'[]'::json"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("prompt_used", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            "prompt_version_used", sa.INTEGER(), autoincrement=False, nullable=True
        ),
        sa.Column("output_document_id", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column("output_document_url", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column("progress", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "logs",
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "preview_pdf_document_id", sa.UUID(), autoincrement=False, nullable=True
        ),
        sa.Column(
            "preview_pdf_document_url", sa.TEXT(), autoincrement=False, nullable=True
        ),
        sa.ForeignKeyConstraint(
            ["org_id"], ["organisations.id"], name=op.f("jobs_org_id_fkey")
        ),
        sa.ForeignKeyConstraint(
            ["output_document_id"],
            ["documents.id"],
            name=op.f("jobs_output_document_id_fkey"),
        ),
        sa.ForeignKeyConstraint(
            ["preview_pdf_document_id"],
            ["documents.id"],
            name=op.f("jobs_preview_pdf_document_id_fkey"),
        ),
        sa.ForeignKeyConstraint(
            ["template_id"], ["documents.id"], name=op.f("jobs_template_id_fkey")
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("jobs_user_id_fkey")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("jobs_pkey")),
    )

    op.create_table(
        "organisation_templates",
        sa.Column("org_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("template_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("shared_by_user_id", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column(
            "shared_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["org_id"],
            ["organisations.id"],
            name=op.f("organisation_templates_org_id_fkey"),
        ),
        sa.ForeignKeyConstraint(
            ["shared_by_user_id"],
            ["users.id"],
            name=op.f("organisation_templates_shared_by_user_id_fkey"),
        ),
        sa.ForeignKeyConstraint(
            ["template_id"],
            ["documents.id"],
            name=op.f("organisation_templates_template_id_fkey"),
        ),
        sa.PrimaryKeyConstraint("org_id", "template_id", name=op.f("uix_org_template")),
    )
