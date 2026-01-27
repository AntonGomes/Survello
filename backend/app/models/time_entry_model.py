from datetime import datetime, timezone
from typing import TYPE_CHECKING, ClassVar
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .instruction_model import Instruction
    from .user_model import User


class TimeEntryBase(SQLModel):
    instruction_id: int = Field(foreign_key="projects.id")
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: datetime | None = None
    description: str | None = None
    duration_minutes: int | None = None  # Computed on stop, stored for reporting
    update_id: str | None = None  # Links to the UUID of the update in instruction.updates


class TimeEntry(TimeEntryBase, table=True):
    __tablename__: ClassVar[str] = "time_entries"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    # Relationships
    instruction: "Instruction" = Relationship()
    user: "User" = Relationship()


class TimeEntryCreate(SQLModel):
    instruction_id: int
    description: str | None = None


class TimeEntryManualCreate(SQLModel):
    """For manually logging time without using the timer."""

    instruction_id: int
    duration_minutes: int
    description: str | None = None


class TimeEntryRead(TimeEntryBase):
    id: int
    user_id: int


class TimeEntryOut(TimeEntryRead):
    instruction_name: str
    user_name: str | None = None
