from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, AutoString
from pydantic import EmailStr

if TYPE_CHECKING:
    from .job_model import Job

# -----------------------------------------------------------------------------
# CLIENT CONTACT
# -----------------------------------------------------------------------------


class ClientContactBase(SQLModel):
    name: str = Field(max_length=255)
    email: EmailStr | None = Field(default=None, sa_type=AutoString)
    phone: str | None = Field(default=None, max_length=64)
    role_title: str | None = Field(default=None, max_length=255)


class ClientContact(ClientContactBase, table=True):
    __tablename__ = "client_contacts"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    client_id: int = Field(foreign_key="clients.id", ondelete="CASCADE")
    client: "Client" = Relationship(back_populates="contacts")


class ClientContactCreate(ClientContactBase):
    pass


class ClientContactRead(ClientContactBase):
    id: int
    client_id: int
    created_at: datetime


# -----------------------------------------------------------------------------
# CLIENT
# -----------------------------------------------------------------------------


class ClientBase(SQLModel):
    name: str = Field(max_length=255)
    address: str | None = Field(default=None, sa_type=AutoString)


class Client(ClientBase, table=True):
    __tablename__ = "clients"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")

    # Relationships
    contacts: list[ClientContact] = Relationship(
        back_populates="client",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    jobs: list["Job"] = Relationship(back_populates="client")


class ClientCreate(ClientBase):
    contacts: list[ClientContactCreate] = []


class ClientUpdate(SQLModel):
    name: str | None = None
    address: str | None = None


class ClientRead(ClientBase):
    id: int
    org_id: int | None
    created_at: datetime
    updated_at: datetime
    contacts: list[ClientContactRead] = []
