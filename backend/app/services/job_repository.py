# backend/app/services/run_repository.py

from __future__ import annotations

from typing import Optional, List

from sqlalchemy.orm import Session

from app.models.orm import Run, RunFile, RunStatus, FileRole


class RunRepository:
    """Encapsulates all database access related to Runs."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_run(self, run_id: int) -> Optional[Run]:
        return self.db.query(Run).filter(Run.id == run_id).first()

    def create_run(
        self,
        org_id: Optional[int] = None,
        created_by_user_id: int,
        template_file_id: int = None,
        input_file_ids: List[int] = None,
        job_id: Optional[int] = None,
    ) -> Run:
        """
        Creates a Run and links input files via RunFile association.

        Args:
            org_id: The organization this run belongs to
            created_by_user_id: The user creating the run
            job_id: Optional job this run is associated with
            template_file_id: Optional File.id for the template
            input_file_ids: Optional list of File.ids for context/input files
        """
        # 1. Create the Run record
        run = Run(
            org_id=org_id,
            created_by_user_id=created_by_user_id,
            job_id=job_id,
            status=RunStatus.ACTIVE,
        )
        self.db.add(run)
        self.db.flush()  # Get the run.id

        # 2. Link the template file
        template_link = RunFile(
            run_id=run.id,
            file_id=template_file_id,
            role=FileRole.TEMPLATE,
        )
        self.db.add(template_link)

        # 3. Link input/context files (if provided)
        for file_id in input_file_ids:
            input_link = RunFile(
                run_id=run.id,
                file_id=file_id,
                role=FileRole.INPUT,
            )
            self.db.add(input_link)

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

    def add_artefact_to_run(
        self,
        run_id: int,
        file_id: int,
        role: FileRole = FileRole.ARTIFACT,
    ) -> RunFile:
        """Link an output/artefact file to a run."""
        run_file = RunFile(
            run_id=run_id,
            file_id=file_id,
            role=role,
        )
        self.db.add(run_file)
        self.db.commit()
        return run_file
