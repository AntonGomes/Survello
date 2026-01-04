from __future__ import annotations

from datetime import datetime
from typing import List, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.types import Enum as SAEnum

from app.db.base import Base
from app.core.enums import UserRole

if TYPE_CHECKING:
    from .client_model import Client
    from .work_model import Job, Project
    from .run_model import Run
    from .file_model import File, Artefact
    # Session is defined in this file, so no need to import if it's below.
    # But wait, I haven't seen Session definition yet. Assuming it is in this file.

# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------


def PgEnum(enum_cls, name: str):
    return SAEnum(
        enum_cls,
        name=name,
        values_callable=lambda e: [m.value for m in e],
        native_enum=True,
        validate_strings=True,
    )


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------


class Org(Base):
    __tablename__ = "orgs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    users: Mapped[List["User"]] = relationship(
        back_populates="org",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    clients: Mapped[List["Client"]] = relationship(back_populates="org")
    jobs: Mapped[List["Job"]] = relationship(back_populates="org")
    projects: Mapped[List["Project"]] = relationship(back_populates="org")
    runs: Mapped[List["Run"]] = relationship(back_populates="org")
    files: Mapped[List["File"]] = relationship(back_populates="org")
    artefacts: Mapped[List["Artefact"]] = relationship(back_populates="org")

    def __repr__(self) -> str:
        return f"Org(id={self.id}, name={self.name!r})"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(320), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=True
    )  # for now till new auth

    role: Mapped[UserRole] = mapped_column(
        PgEnum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.MEMBER,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    org: Mapped["Org"] = relationship(back_populates="users")

    created_jobs: Mapped[List["Job"]] = relationship(
        back_populates="created_by_user",
        foreign_keys="Job.created_by_user_id",
    )
    created_runs: Mapped[List["Run"]] = relationship(
        back_populates="created_by_user",
        foreign_keys="Run.created_by_user_id",
    )
    uploaded_files: Mapped[List["File"]] = relationship(
        back_populates="uploaded_by_user",
        foreign_keys="File.owner_user_id",
    )
    sessions: Mapped[List["Session"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"User(id={self.id}, email={self.email!r}, org_id={self.org_id})"


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    session_token: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="sessions")

    def __repr__(self) -> str:
        return f"Session(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})"
