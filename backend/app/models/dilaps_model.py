from datetime import UTC, datetime
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING, ClassVar, Optional

from sqlmodel import AutoString, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .file_model import File
    from .run_model import Run


class DilapsStatus(str, Enum):
    IDLE = "idle"
    EMBEDDING = "embedding"
    SECTIONING = "sectioning"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    ERROR = "error"


class DilapsUnit(str, Enum):
    SUM = "Sum"
    METRE = "m"
    METRE_SQ = "m\u00b2"
    NUMBER = "No"


class DilapsSectionFileLink(SQLModel, table=True):
    __tablename__: ClassVar[str] = "dilaps_section_file_links"
    section_id: int | None = Field(
        default=None,
        foreign_key="dilaps_sections.id",
        primary_key=True,
        ondelete="CASCADE",
    )
    file_id: int | None = Field(
        default=None,
        foreign_key="files.id",
        primary_key=True,
        ondelete="CASCADE",
    )


class DilapsRunBase(SQLModel):
    property_address: str = Field(max_length=1024)
    lease_summary: str | None = None
    status: DilapsStatus = Field(
        default=DilapsStatus.IDLE, sa_type=AutoString
    )
    progress_pct: int = Field(default=0)
    error_message: str | None = None


class DilapsRun(DilapsRunBase, table=True):
    __tablename__: ClassVar[str] = "dilaps_runs"
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
    )

    run_id: int = Field(foreign_key="runs.id", ondelete="CASCADE")
    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    created_by_user_id: int = Field(
        foreign_key="users.id", ondelete="RESTRICT"
    )
    job_id: int | None = Field(
        default=None, foreign_key="jobs.id", ondelete="SET NULL"
    )

    run: "Run" = Relationship()
    sections: list["DilapsSection"] = Relationship(
        back_populates="dilaps_run",
        sa_relationship_kwargs={"order_by": "DilapsSection.sort_order"},
    )


class DilapsRunCreate(SQLModel):
    property_address: str
    lease_summary: str | None = None
    job_id: int | None = None
    template_file_id: int
    context_file_ids: list[int]


class DilapsRunRead(DilapsRunBase):
    id: int
    run_id: int
    org_id: int
    created_by_user_id: int
    job_id: int | None = None
    created_at: datetime
    updated_at: datetime


class DilapsSectionBase(SQLModel):
    name: str = Field(max_length=256)
    sort_order: int = Field(default=0)
    sheet_name: str | None = Field(default=None, max_length=31)


class DilapsSection(DilapsSectionBase, table=True):
    __tablename__: ClassVar[str] = "dilaps_sections"
    id: int | None = Field(default=None, primary_key=True)

    dilaps_run_id: int = Field(
        foreign_key="dilaps_runs.id", ondelete="CASCADE"
    )

    dilaps_run: "DilapsRun" = Relationship(back_populates="sections")
    items: list["DilapsItem"] = Relationship(
        back_populates="section",
        sa_relationship_kwargs={"order_by": "DilapsItem.sort_order"},
    )
    files: list["File"] = Relationship(link_model=DilapsSectionFileLink)


class DilapsSectionRead(DilapsSectionBase):
    id: int
    dilaps_run_id: int


class DilapsSectionUpdate(SQLModel):
    name: str | None = None
    sort_order: int | None = None
    sheet_name: str | None = None


class DilapsItemBase(SQLModel):
    item_number: str = Field(max_length=20)
    lease_clause: str = Field(max_length=256)
    want_of_repair: str
    remedy: str
    unit: DilapsUnit = Field(sa_type=AutoString)
    quantity: Decimal | None = None
    rate: Decimal | None = None
    cost: Decimal | None = None
    sort_order: int = Field(default=0)


class DilapsItem(DilapsItemBase, table=True):
    __tablename__: ClassVar[str] = "dilaps_items"
    id: int | None = Field(default=None, primary_key=True)

    section_id: int = Field(
        foreign_key="dilaps_sections.id", ondelete="CASCADE"
    )

    section: "DilapsSection" = Relationship(back_populates="items")


class DilapsItemCreate(SQLModel):
    item_number: str | None = None
    lease_clause: str
    want_of_repair: str
    remedy: str
    unit: DilapsUnit = DilapsUnit.SUM
    quantity: Decimal | None = None
    rate: Decimal | None = None
    cost: Decimal | None = None


class DilapsItemRead(DilapsItemBase):
    id: int
    section_id: int


class DilapsItemUpdate(SQLModel):
    item_number: str | None = None
    lease_clause: str | None = None
    want_of_repair: str | None = None
    remedy: str | None = None
    unit: DilapsUnit | None = None
    quantity: Decimal | None = None
    rate: Decimal | None = None
    cost: Decimal | None = None
    sort_order: int | None = None
