# backend/app/services/artefact_repository.py

from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm import Artefact, ArtefactType
from app.services.file_repository import FileRepository


class ArtefactRepository:
    """Encapsulates all database access related to Artefacts ."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.file_repo = FileRepository(db)

    def get_artefact(self, artefact_id: int) -> Optional[Artefact]:
        return self.db.query(Artefact).filter(Artefact.id == artefact_id).first()

    def get_latest_artefact_by_run(self, run_id: int) -> Optional[Artefact]:
        return (
            self.db.query(Artefact)
            .filter(Artefact.run_id == run_id)
            .order_by(Artefact.version.desc())
            .first()
        )

    def create_artefact(
        self,
        run_id: int,
        job_id: Optional[int],
        version: int,
        artefact_type: ArtefactType,
        title: Optional[str],
        artefact_file_id: int,
        pdf_preview_file_id: int,
        org_id: Optional[int] = None,
    ) -> Artefact:
        artefact = Artefact(
            # org_id=org_id,
            job_id=job_id,
            run_id=run_id,
            version=version,
            artefact_type=artefact_type,
            title=title,
            file_id=artefact_file_id,
            preview_file_id=pdf_preview_file_id,
        )

        self.db.add(artefact)
        self.db.commit()
        return artefact
