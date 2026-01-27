"""
Waitlist model for capturing early access signups.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class WaitlistBase(SQLModel):
    """Base waitlist fields."""

    email: str = Field(index=True, unique=True)
    name: Optional[str] = Field(default=None)
    company: Optional[str] = Field(default=None)


class Waitlist(WaitlistBase, table=True):
    """Database model for waitlist entries."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notified: bool = Field(default=False)


class WaitlistCreate(SQLModel):
    """Schema for creating a waitlist entry."""

    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None


class WaitlistRead(SQLModel):
    """Schema for reading a waitlist entry."""

    id: UUID
    email: str
    name: Optional[str]
    company: Optional[str]
    created_at: datetime
