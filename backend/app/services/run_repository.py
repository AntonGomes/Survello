# backend/app/services/run_repository.py

from __future__ import annotations

from typing import Optional, List

from sqlalchemy.orm import Session

from app.models.orm import Run, RunFile, RunStatus, FileRole
from app.models.models import FileRead
from app.services.file_repository import FileRepository
from app.services.artefact_repository import ArtefactRepository


class RunRepository:
    """Encapsulates all database access related to Runs."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.file_repo = FileRepository(db)
        self.artefact_repo = ArtefactRepository(db)

    def get_run(self, run_id: int) -> Optional[Run]:
        return self.db.query(Run).filter(Run.id == run_id).first()

    def get_run_files(self, run_id: int) -> Optional[List[FileRead]]:
        """Finds all files associated with this run

        Returns:
            List[FileRead]: list of lightweight file dtos
        """
        run_files = self.get_run(run_id).run_files
        if run_files:
            return [FileRead.model_validate(rf.file) for rf in run_files]

    def create_run(
        self,
        created_by_user_id: int,
        template: FileRead,
        context_files: List[FileRead],
        org_id: Optional[int] = None, # TODO: 
        job_id: Optional[int] = None,
    ) -> Run:
        """
        Creates a Run, File records, and RunFile associations in one transaction.

        Args:
            org_id: The organization this run belongs to
            created_by_user_id: The user creating the run
            template: FileInput DTO for the template file
            context_files: List of FileInput DTOs for context/input files
            job_id: Optional job this run is associated with
        """
        # 1. Create the Run record
        run = Run(
            # org_id=org_id,
            created_by_user_id=created_by_user_id,
            job_id=job_id,
            status=RunStatus.IDLE,
        )
        self.db.add(run)
        self.db.flush()

        # 2. Create template File + link it
        template_file = self.file_repo.create_file(
            # org_id=org_id,
            owner_user_id=created_by_user_id,
            storage_key=template.storage_key,
            file_name=template.file_name,
            mime_type=template.mime_type,
            role=FileRole.TEMPLATE,
            commit=False,
        )
        self.db.add(
            RunFile(run_id=run.id, file_id=template_file.id, role=FileRole.TEMPLATE)
        )

        # 3. Create context Files + link them
        for ctx in context_files:
            ctx_file = self.file_repo.create_file(
                # org_id=org_id,
                owner_user_id=created_by_user_id,
                storage_key=ctx.storage_key,
                file_name=ctx.file_name,
                mime_type=ctx.mime_type,
                role=FileRole.INPUT,
                commit=False,
            )
            self.db.add(
                RunFile(run_id=run.id, file_id=ctx_file.id, role=FileRole.INPUT)
            )

        # 4. Commit everything together
        self.db.commit()
        self.db.refresh(run)
        return run

    def update_status(self, run_id: int, status: RunStatus) -> Optional[Run]:
        run = self.get_run(run_id)
        if run:
            run.status = status
            self.db.commit()
            self.db.refresh(run)
        return run

    def bump_upload_progress(self, run_id: int, increment: int = 1) -> Optional[Run]:
        run = self.get_run(run_id)
        if run:
            run.upload_progress = (run.upload_progress or 0) + increment
            self.db.commit()
            self.db.refresh(run)
        return run

    def update_model_responses(self, run_id: int, new_response: str) -> Optional[Run]:
        run = self.get_run(run_id)
        if run:
            run.model_responses.append(new_response)
            self.db.commit()
            self.db.refresh(run)
        return run
