from datetime import UTC, datetime
from enum import Enum
from typing import TYPE_CHECKING, Any, ClassVar

from sqlalchemy import JSON, Column
from sqlmodel import AutoString, Field, Relationship, SQLModel

# Import unified UpdateItem for type hints and re-export for backwards compatibility
from .update_model import UpdateItem as InstructionUpdateItem  # noqa: F401

if TYPE_CHECKING:
    from .file_model import File
    from .job_model import Job
    from .user_model import User


class InstructionStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


# Backwards compatibility alias
ProjectStatus = InstructionStatus


class FeeType(str, Enum):
    FIXED = "fixed"
    HOURLY = "hourly"
    MIXED = "mixed"


# -----------------------------------------------------------------------------
# INSTRUCTION UPDATE - Now uses unified UpdateItem from update_model.py
# The InstructionUpdateItem alias is kept for backwards compatibility.
# -----------------------------------------------------------------------------


# -----------------------------------------------------------------------------
# INSTRUCTION (formerly Project)
# -----------------------------------------------------------------------------


class InstructionBase(SQLModel):
    description: str | None = Field(default=None, sa_type=AutoString)
    status: InstructionStatus | None = Field(default=None, sa_type=AutoString)
    # Unified updates feed - stores list of InstructionUpdateItem dicts
    updates: list[dict[str, Any]] | None = Field(default=None, sa_column=Column(JSON))
    deadline: datetime | None = Field(default=None)


class Instruction(InstructionBase, table=True):
    # Keep same table name for backwards compatibility with existing data
    __tablename__: ClassVar[str] = "projects"
    id: int | None = Field(default=None, primary_key=True)
    # Semantic instruction number (auto-generated per org, e.g., INS-00042)
    instruction_number: str | None = Field(default=None, max_length=32, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
    )

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    created_by_user_id: int = Field(foreign_key="users.id", ondelete="RESTRICT")
    lead_user_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )
    job_id: int = Field(foreign_key="jobs.id", ondelete="CASCADE")
    instruction_type_id: int = Field(foreign_key="project_types.id")

    instruction_type: "InstructionType" = Relationship(back_populates="instructions")
    job: "Job" = Relationship(back_populates="instructions")
    created_by_user: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Instruction.created_by_user_id]"}
    )
    lead_user: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Instruction.lead_user_id]"}
    )
    files: list["File"] = Relationship(back_populates="instruction")


# Backwards compatibility alias
Project = Instruction


class InstructionCreate(InstructionBase):
    lead_user_id: int | None = None
    job_id: int
    instruction_type_id: int | None = None


# Backwards compatibility alias
ProjectCreate = InstructionCreate


class InstructionUpdate(SQLModel):
    description: str | None = None
    status: InstructionStatus | None = None
    updates: list[dict[str, Any]] | None = None
    deadline: datetime | None = None
    lead_user_id: int | None = None


# Backwards compatibility alias
ProjectUpdate = InstructionUpdate


class InstructionAddUpdate(SQLModel):
    """Request body for adding an update to an instruction."""

    text: str
    time_entry_id: int | None = None


# Backwards compatibility alias
ProjectAddUpdate = InstructionAddUpdate


class InstructionRead(InstructionBase):
    id: int
    instruction_number: str | None = None
    instruction_type_id: int
    job_id: int
    lead_user_id: int | None = None
    created_at: datetime
    updated_at: datetime


# Backwards compatibility alias
ProjectRead = InstructionRead


# -----------------------------------------------------------------------------
# INSTRUCTION TYPE (formerly ProjectType)
# -----------------------------------------------------------------------------


class InstructionTypeBase(SQLModel):
    name: str = Field(max_length=255)
    description: str | None = None


class InstructionType(InstructionTypeBase, table=True):
    # Keep same table name for backwards compatibility with existing data
    __tablename__: ClassVar[str] = "project_types"
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
    )

    org_id: int | None = Field(default=None, foreign_key="orgs.id", ondelete="CASCADE")
    default_template_file_id: int | None = Field(
        default=None, foreign_key="files.id", ondelete="SET NULL"
    )

    instructions: list["Instruction"] = Relationship(back_populates="instruction_type")


# Backwards compatibility alias
ProjectType = InstructionType


class InstructionTypeRead(InstructionTypeBase):
    id: int
    default_template_file_id: int | None = None
    created_at: datetime
    updated_at: datetime


# Backwards compatibility alias
ProjectTypeRead = InstructionTypeRead


class InstructionTypeCreate(InstructionTypeBase):
    default_template_file_id: int | None = None


# Backwards compatibility alias
ProjectTypeCreate = InstructionTypeCreate


class InstructionTypeUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    default_template_file_id: int | None = None


# Backwards compatibility alias
ProjectTypeUpdate = InstructionTypeUpdate


class InstructionReadWithInstructionType(InstructionRead):
    instruction_type: InstructionTypeRead


# Backwards compatibility alias
ProjectReadWithProjectType = InstructionReadWithInstructionType
