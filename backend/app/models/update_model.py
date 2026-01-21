"""
Unified Update Model for Jobs and Projects.

This module provides a shared UpdateItem structure that can be used by both
jobs and projects, enabling consistent update tracking across entities.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel
from sqlmodel import Field


class UpdateType(str, Enum):
    """Types of updates that can be recorded."""

    TEXT = "text"  # Manual text update from user
    FILE_UPLOAD = "file_upload"  # Files were uploaded
    PROJECT_CREATED = "project_created"  # A project was created
    SURVEY_CREATED = "survey_created"  # A survey was created
    STATUS_CHANGE = "status_change"  # Status was changed
    JOB_CREATED = "job_created"  # Job was created


class UpdateItem(BaseModel):
    """
    A single update entry in a project or job updates feed.

    This is a Pydantic model that gets serialized to JSON in the database.
    It supports both manual text updates and system-generated updates.
    """

    id: str = Field(default_factory=lambda: str(uuid4()))
    update_type: UpdateType = UpdateType.TEXT
    text: str

    # Author info (denormalized for display performance)
    author_id: int
    author_name: Optional[str] = None
    author_initials: Optional[str] = None

    # Timestamp
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Optional links to related entities
    time_entry_id: Optional[int] = None  # Links to a time entry
    project_id: Optional[int] = None  # Links to a project (for job updates)
    survey_id: Optional[int] = None  # Links to a survey
    file_count: Optional[int] = None  # Number of files uploaded (for file_upload type)

    # Source tracking for job-level aggregation
    source_project_id: Optional[int] = None  # If this update came from a child project
    source_project_name: Optional[str] = None  # Name of source project for display


def create_text_update(
    text: str,
    author_id: int,
    author_name: str | None = None,
    author_initials: str | None = None,
    time_entry_id: int | None = None,
) -> UpdateItem:
    """Create a manual text update."""
    return UpdateItem(
        update_type=UpdateType.TEXT,
        text=text,
        author_id=author_id,
        author_name=author_name,
        author_initials=author_initials,
        time_entry_id=time_entry_id,
    )


def create_file_upload_update(
    file_count: int,
    author_id: int,
    author_name: str | None = None,
    author_initials: str | None = None,
) -> UpdateItem:
    """Create a system update for file uploads."""
    return UpdateItem(
        update_type=UpdateType.FILE_UPLOAD,
        text=f"uploaded {file_count} file{'s' if file_count != 1 else ''}",
        author_id=author_id,
        author_name=author_name,
        author_initials=author_initials,
        file_count=file_count,
    )


def create_project_created_update(
    project_name: str,
    project_id: int,
    author_id: int,
    author_name: str | None = None,
    author_initials: str | None = None,
) -> UpdateItem:
    """Create a system update for project creation."""
    return UpdateItem(
        update_type=UpdateType.PROJECT_CREATED,
        text=f'created project "{project_name}"',
        author_id=author_id,
        author_name=author_name,
        author_initials=author_initials,
        project_id=project_id,
    )


def create_survey_created_update(
    author_id: int,
    author_name: str | None = None,
    author_initials: str | None = None,
    survey_id: int | None = None,
) -> UpdateItem:
    """Create a system update for survey creation."""
    return UpdateItem(
        update_type=UpdateType.SURVEY_CREATED,
        text="created a survey",
        author_id=author_id,
        author_name=author_name,
        author_initials=author_initials,
        survey_id=survey_id,
    )


def create_status_change_update(
    old_status: str | None,
    new_status: str,
    author_id: int,
    author_name: str | None = None,
    author_initials: str | None = None,
) -> UpdateItem:
    """Create a system update for status changes."""
    if old_status:
        text = f'changed status from "{old_status}" to "{new_status}"'
    else:
        text = f'set status to "{new_status}"'
    return UpdateItem(
        update_type=UpdateType.STATUS_CHANGE,
        text=text,
        author_id=author_id,
        author_name=author_name,
        author_initials=author_initials,
    )
