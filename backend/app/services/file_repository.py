# backend/app/services/file_repository.py

from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm import File, FileRole
from app.models.models import FileRead


class FileRepository:
    """Encapsulates all database access related to Files."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_file(self, file_id: int) -> Optional[FileRead]:
        file = self.db.query(File).filter(File.id == file_id).first()
        if file:
            return FileRead.model_validate(file)

    def create_file(
        self,
        owner_user_id: int,
        storage_key: str,
        file_name: str,
        mime_type: str,
        role: FileRole,
        commit: bool = True,
        org_id: Optional[int] = None,
    ) -> FileRead:
        """
        Creates a File record.

        Args:
            commit: If False, caller is responsible for committing the transaction.
        """
        file = File(
            # org_id=org_id,
            owner_user_id=owner_user_id,
            storage_key=storage_key,
            file_name=file_name,
            mime_type=mime_type,
            role=role,
        )
        self.db.add(file)
        self.db.flush()  # Always flush to get the ID

        if commit:
            self.db.commit()

        return FileRead.model_validate(file)
