from __future__ import annotations

from datetime import UTC, datetime
from typing import ClassVar

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class ImageEmbedding(SQLModel, table=True):
    __tablename__: ClassVar[str] = "image_embeddings"
    id: int | None = Field(default=None, primary_key=True)
    file_id: int = Field(foreign_key="files.id", unique=True, ondelete="CASCADE")
    embedding: list[float] = Field(sa_column=Column(JSON))
    model_name: str = Field(max_length=128)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
