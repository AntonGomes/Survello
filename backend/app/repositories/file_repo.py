from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.file_model import File
from app.schemas.file_schemas import FileCreate


class FileRepository:
    """Encapsulates all database access related to Files."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, file_id: int) -> Optional[File]:
        return self.db.query(File).filter(File.id == file_id).first()

    def create(
        self,
        file_in: FileCreate,
        commit: bool = True,
    ) -> File:
        """
        Creates a File record.

        Args:
            commit: If False, caller is responsible for committing the transaction.
        """
        file = File(
            org_id=file_in.org_id,
            owner_user_id=file_in.owner_user_id,
            storage_key=file_in.storage_key,
            file_name=file_in.file_name,
            mime_type=file_in.mime_type,
            role=file_in.role,
        )
        self.db.add(file)
        self.db.flush()  # Always flush to get the ID

        if commit:
            self.db.commit()
            self.db.refresh(file)

        return file
