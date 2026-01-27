from datetime import datetime, timezone
from typing import TYPE_CHECKING, ClassVar
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
    __tablename__: ClassVar[str] = "client_contacts"
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    client_id: int = Field(foreign_key="clients.id", ondelete="CASCADE")
    client: "Client" = Relationship(
        back_populates="contacts",
        sa_relationship_kwargs={"foreign_keys": "[ClientContact.client_id]"},
    )


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
    is_individual: bool = Field(default=False)
    # Individual client contact fields (used when is_individual=True)
    email: EmailStr | None = Field(default=None, sa_type=AutoString)
    phone: str | None = Field(default=None, max_length=64)


class Client(ClientBase, table=True):
    __tablename__: ClassVar[str] = "clients"
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    key_contact_id: int | None = Field(
        default=None, foreign_key="client_contacts.id", ondelete="SET NULL"
    )

    # Relationships
    contacts: list[ClientContact] = Relationship(
        back_populates="client",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "foreign_keys": "[ClientContact.client_id]",
        },
    )
    jobs: list["Job"] = Relationship(back_populates="client")


class ClientCreate(ClientBase):
    contacts: list[ClientContactCreate] = []


class ClientUpdate(SQLModel):
    name: str | None = None
    address: str | None = None
    key_contact_id: int | None = None
    is_individual: bool | None = None
    email: str | None = None
    phone: str | None = None


class ClientRead(ClientBase):
    id: int
    org_id: int | None
    name: str
    created_at: datetime
    updated_at: datetime
    key_contact_id: int | None = None
    contacts: list[ClientContactRead] = []


class ClientReadMinimal(ClientBase):
    id: int
    # Inherits name and address from ClientBase
