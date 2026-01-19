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


# -----------------------------------------------------------------------------
# INVITATION MODELS
# -----------------------------------------------------------------------------
class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"


class Invitation(SQLModel, table=True):
    __tablename__ = "invitations"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr = Field(sa_type=AutoString, index=True)
    token: str = Field(max_length=255, unique=True, index=True)
    status: InvitationStatus = Field(
        default=InvitationStatus.PENDING, sa_type=AutoString
    )
    org_id: int = Field(foreign_key="orgs.id")
    invited_by_user_id: int = Field(foreign_key="users.id")
    role: UserRole = Field(default=UserRole.MEMBER, sa_type=AutoString)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(nullable=False)

    # Relationships
    org: Org = Relationship()
    invited_by: User = Relationship()


class InvitationCreate(SQLModel):
    email: EmailStr
    role: UserRole = UserRole.MEMBER


class InvitationRead(SQLModel):
    id: int
    email: str
    status: InvitationStatus
    role: UserRole
    created_at: datetime
    expires_at: datetime


class InvitationPublic(SQLModel):
    """Public info shown to invited user (no sensitive data)"""

    email: str
    org_name: str
    invited_by_name: str
    expires_at: datetime


class InvitationAccept(SQLModel):
    token: str
    name: str
    password: str


# -----------------------------------------------------------------------------
# ORG USER MANAGEMENT
# -----------------------------------------------------------------------------
class OrgUserRead(SQLModel):
    """User info for org management (admins viewing org members)"""

    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime


class OrgReadWithUsers(OrgBase):
    id: int
    created_at: datetime
    users: list[OrgUserRead] = []
