from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Any, ClassVar
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from sqlalchemy import JSON, Column


if TYPE_CHECKING:
    from .quote_model import Quote


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    CONVERTED = "converted"
    LOST = "lost"


# -----------------------------------------------------------------------------
# LEAD
# -----------------------------------------------------------------------------


class LeadBase(SQLModel):
    name: str = Field(max_length=255)  # Company or individual name
    contact_name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, sa_type=AutoString)
    phone: str | None = Field(default=None, max_length=64)
    status: LeadStatus = Field(default=LeadStatus.NEW, sa_type=AutoString)
    notes: str | None = Field(default=None, sa_type=AutoString)


class Lead(LeadBase, table=True):
    __tablename__: ClassVar[str] = "leads"
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )
    # JSON array of updates: [{text: str, user_id: int, created_at: str}]
    updates: List[Any] | None = Field(default=None, sa_column=Column(JSON))

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")

    # When converted, links to the created client
    converted_client_id: int | None = Field(
        default=None, foreign_key="clients.id", ondelete="SET NULL"
    )

    # Relationships
    quotes: list["Quote"] = Relationship(back_populates="lead")


class LeadCreate(LeadBase):
    pass


class LeadUpdate(SQLModel):
    name: str | None = None
    contact_name: str | None = None
    email: str | None = None
    phone: str | None = None
    status: LeadStatus | None = None
    notes: str | None = None


class LeadRead(LeadBase):
    id: int
    org_id: int
    created_at: datetime
    updated_at: datetime
    updates: List[Any] | None = None
    converted_client_id: int | None = None


class LeadReadMinimal(SQLModel):
    id: int
    name: str
    contact_name: str | None = None
    status: LeadStatus
