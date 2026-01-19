from datetime import datetime, date, timezone
from typing import TYPE_CHECKING, List, Any
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from sqlalchemy import JSON, Column

from .client_model import Client, ClientReadMinimal
from .lead_model import Lead, LeadReadMinimal
from .project_model import ProjectType, ProjectTypeRead


if TYPE_CHECKING:
    pass


class QuoteStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"


# -----------------------------------------------------------------------------
# QUOTE LINE (potential project on a quote)
# -----------------------------------------------------------------------------


class QuoteLineBase(SQLModel):
    estimated_fee: float | None = Field(default=None)
    notes: str | None = Field(default=None, sa_type=AutoString)


class QuoteLine(QuoteLineBase, table=True):
    __tablename__ = "quote_lines"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)

    quote_id: int = Field(foreign_key="quotes.id", ondelete="CASCADE")
    project_type_id: int = Field(foreign_key="project_types.id", ondelete="RESTRICT")

    quote: "Quote" = Relationship(back_populates="lines")
    project_type: ProjectType = Relationship()


class QuoteLineCreate(QuoteLineBase):
    project_type_id: int


class QuoteLineRead(QuoteLineBase):
    id: int
    quote_id: int
    project_type_id: int
    project_type: ProjectTypeRead


# -----------------------------------------------------------------------------
# QUOTE
# -----------------------------------------------------------------------------


class QuoteBase(SQLModel):
    name: str = Field(max_length=255)  # Usually site address
    estimated_fee: float | None = Field(default=None)  # Total estimated fee
    status: QuoteStatus = Field(default=QuoteStatus.DRAFT, sa_type=AutoString)
    expected_start_date: date | None = Field(default=None)
    notes: str | None = Field(default=None, sa_type=AutoString)


class Quote(QuoteBase, table=True):
    __tablename__ = "quotes"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )
    # JSON array of updates: [{text: str, user_id: int, created_at: str}]
    updates: List[Any] | None = Field(default=None, sa_column=Column(JSON))

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    # Either client_id or lead_id should be set, not both
    client_id: int | None = Field(
        default=None, foreign_key="clients.id", ondelete="SET NULL"
    )
    lead_id: int | None = Field(
        default=None, foreign_key="leads.id", ondelete="SET NULL"
    )

    # When converted, links to the created job
    converted_job_id: int | None = Field(
        default=None, foreign_key="jobs.id", ondelete="SET NULL"
    )

    # Relationships
    client: Client | None = Relationship()
    lead: Lead | None = Relationship(back_populates="quotes")
    lines: list[QuoteLine] = Relationship(
        back_populates="quote",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class QuoteCreate(QuoteBase):
    client_id: int | None = None
    lead_id: int | None = None
    lines: list[QuoteLineCreate] = []


class QuoteUpdate(SQLModel):
    name: str | None = None
    estimated_fee: float | None = None
    status: QuoteStatus | None = None
    expected_start_date: date | None = None
    notes: str | None = None
    client_id: int | None = None
    lead_id: int | None = None


class QuoteRead(QuoteBase):
    id: int
    org_id: int
    client_id: int | None = None
    lead_id: int | None = None
    converted_job_id: int | None = None
    created_at: datetime
    updated_at: datetime
    updates: List[Any] | None = None
    client: ClientReadMinimal | None = None
    lead: LeadReadMinimal | None = None
    lines: list[QuoteLineRead] = []


class QuoteReadMinimal(SQLModel):
    id: int
    name: str
    status: QuoteStatus
    estimated_fee: float | None = None
