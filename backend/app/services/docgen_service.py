from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories.run_repo import RunRepository
from app.repositories.file_repo import FileRepository
from app.repositories.artefact_repo import ArtefactRepository
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService
from app.orchestrators.docgen_orchestrator import DocGenOrchestrator
from app.core.logging import logger


class DocGenService:
    """
    Service layer to handle the setup and execution of the document generation process.
    Encapsulates dependency injection for the orchestrator.
    """

    def __init__(
        self,
        db: Session,
        storage_service: StorageService,
        openai_service: OpenAIService,
    ) -> None:
        self.db = db
        self.run_repo = RunRepository(db)
        self.file_repo = FileRepository(db)
        self.artefact_repo = ArtefactRepository(db)
        self.storage_service = storage_service
        self.openai_service = openai_service

    def execute_run(self, run_id: int) -> None:
        """
        Fetches the run by ID and triggers the orchestration process.
        """
        try:
            # Fetch the run within the current session
            run = self.run_repo.get_by_id(run_id)
            if not run:
                logger.error(
                    f"Run with id={run_id} not found during background execution."
                )
                return

            # Initialize and run the orchestrator
            orchestrator = DocGenOrchestrator(
                run_id=run_id,  # Pass ID, not object
                run_repo=self.run_repo,
                file_repo=self.file_repo,
                artefact_repo=self.artefact_repo,
                storage_service=self.storage_service,
                openai_service=self.openai_service,
            )
            orchestrator.run_process()
        except Exception:
            logger.exception(f"DocGenService execution failed for run_id={run_id}")
            # Ensure we try to mark as error if possible, though orchestrator handles most
            try:
                self.run_repo.update_status(
                    run_id, "error"
                )  # Using string literal or enum if available in scope
            except Exception:
                pass
