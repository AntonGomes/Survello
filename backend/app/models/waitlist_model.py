"""
Waitlist model for capturing early access signups.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class WaitlistBase(SQLModel):
    """Base waitlist fields."""

    email: str = Field(index=True, unique=True)
    name: str | None = Field(default=None)
    company: str | None = Field(default=None)


class Waitlist(WaitlistBase, table=True):
    """Database model for waitlist entries."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    notified: bool = Field(default=False)


class WaitlistCreate(SQLModel):
    """Schema for creating a waitlist entry."""

    email: EmailStr
    name: str | None = None
    company: str | None = None


class WaitlistRead(SQLModel):
    """Schema for reading a waitlist entry."""

    id: UUID
    email: str
    name: str | None
    company: str | None
    created_at: datetime
