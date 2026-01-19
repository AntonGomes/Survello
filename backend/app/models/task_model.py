from datetime import datetime, timezone
from typing import TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString

if TYPE_CHECKING:
    from .project_model import Project
    from .user_model import User


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    WAITING = "waiting"
    DONE = "done"


# -----------------------------------------------------------------------------
# TASK
# -----------------------------------------------------------------------------


class TaskBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, sa_type=AutoString)
    status: TaskStatus = Field(default=TaskStatus.TODO, sa_type=AutoString)
    order: int = Field(default=0)  # For Kanban column ordering
    estimated_hours: float | None = Field(default=None)


class Task(TaskBase, table=True):
    __tablename__ = "tasks"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    project_id: int = Field(foreign_key="projects.id", ondelete="CASCADE")
    assignee_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )

    # Relationships
    project: "Project" = Relationship(back_populates="tasks")
    assignee: "User" = Relationship()


class TaskCreate(TaskBase):
    project_id: int
    assignee_id: int | None = None


class TaskUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    order: int | None = None
    estimated_hours: float | None = None
    assignee_id: int | None = None


class TaskAssigneeRead(SQLModel):
    id: int
    name: str


class TaskRead(TaskBase):
    id: int
    org_id: int
    project_id: int
    assignee_id: int | None = None
    assignee: TaskAssigneeRead | None = None
    created_at: datetime
    updated_at: datetime


class TaskReorder(SQLModel):
    """Request body for reordering a task"""

    status: TaskStatus
    order: int
