from datetime import datetime, timezone
from typing import TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from pydantic import EmailStr

if TYPE_CHECKING:
    from .job_model import Job
    from .file_model import File


# -----------------------------------------------------------------------------
# ENUMS
# -----------------------------------------------------------------------------
class UserRole(str, Enum):
    MEMBER = "member"
    ADMIN = "admin"


# -----------------------------------------------------------------------------
# ORG MODELS
# -----------------------------------------------------------------------------


class OrgBase(SQLModel):
    name: str = Field(max_length=255, nullable=False)


class Org(OrgBase, table=True):
    __tablename__ = "orgs"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    users: list["User"] = Relationship(back_populates="org")
    jobs: list["Job"] = Relationship(back_populates="org")


class OrgCreate(OrgBase):
    pass


class OrgRead(OrgBase):
    id: int
    created_at: datetime


# -----------------------------------------------------------------------------
# USER MODELS
# -----------------------------------------------------------------------------


class UserBase(SQLModel):
    name: str = Field(max_length=255)
    email: EmailStr = Field(unique=True, index=True, sa_type=AutoString)


class User(UserBase, table=True):
    __tablename__ = "users"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    password_hash: str = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    role: UserRole = Field(default=UserRole.MEMBER, sa_type=AutoString, index=True)

    # Foreign Keys
    org_id: int = Field(foreign_key="orgs.id")

    # Relationships
    org: Org = Relationship(back_populates="users")
    created_jobs: list["Job"] = Relationship(
        back_populates="created_by_user",
        sa_relationship_kwargs={"foreign_keys": "[Job.created_by_user_id]"},
    )
    uploaded_files: list["File"] = Relationship(back_populates="uploaded_by_user")
    sessions: list["Session"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str
    role: UserRole
    org_id: int


class UserUpdate(SQLModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    role: UserRole | None = None


class UserRead(UserBase):
    id: int
    org_id: int
    name: str
    role: UserRole


class UserLogin(SQLModel):
    email: EmailStr
    password: str


# -----------------------------------------------------------------------------
# SESSION MODELS
# -----------------------------------------------------------------------------
class SessionBase(SQLModel):
    session_token: str = Field(max_length=512, unique=True, nullable=False)
    expires_at: datetime = Field(nullable=False)


class Session(SessionBase, table=True):
    __tablename__ = "sessions"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    user: User = Relationship(back_populates="sessions")


class SessionCreate(SessionBase):
    user_id: int


class UserRegister(UserBase):
    password: str
    org_name: str
