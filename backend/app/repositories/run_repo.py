from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.db.models.run_model import Run, RunFile
from app.core.enums import RunStatus, FileRole
from app.repositories.file_repo import FileRepository


# TODO: retrun DTOs instead of ORM models
class RunRepository:
    """Encapsulates all database access related to Runs."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.file_repo = FileRepository(db)

    def get_by_id(self, run_id: int) -> Optional[Run]:
        return self.db.query(Run).filter(Run.id == run_id).first()

    def create_run(
        self,
        created_by_user_id: int,
        template_id: int,
        context_file_ids: List[int],
        org_id: Optional[int] = None,
        job_id: Optional[int] = None,
    ) -> Run:
        """
        Creates a Run, linking existing File records.
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

        # 2. Link template File
        self.db.add(RunFile(run_id=run.id, file_id=template_id, role=FileRole.TEMPLATE))

        # 3. Link context Files
        for file_id in context_file_ids:
            self.db.add(RunFile(run_id=run.id, file_id=file_id, role=FileRole.INPUT))

        # 4. Commit everything together
        self.db.commit()
        self.db.refresh(run)
        return run

    def update_progress(self, run_id: int, progress: float) -> Optional[Run]:
        run = self.get_by_id(run_id)
        if run:
            run.upload_progress = progress
            self.db.commit()
            self.db.refresh(run)
        return run

    def update_model_responses(
        self, run_id: int, new_responses: List[str]
    ) -> Optional[Run]:
        run = self.get_by_id(run_id)
        if run:
            if run.model_responses:
                run.model_responses.extend(new_responses)
            else:
                run.model_responses = new_responses
            flag_modified(run, "model_responses")  # Explicitly flag as modified
            self.db.commit()
            self.db.refresh(run)
        return run

    def update_status(self, run_id: int, status: RunStatus) -> Optional[Run]:
        run = self.get_by_id(run_id)
        if run:
            run.status = status
            self.db.commit()
            self.db.refresh(run)
        return run
