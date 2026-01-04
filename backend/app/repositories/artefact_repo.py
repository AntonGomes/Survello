from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.file_model import Artefact
from app.core.enums import ArtefactType


class ArtefactRepository:
    """Encapsulates all database access related to Artefacts."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, artefact_id: int) -> Optional[Artefact]:
        return self.db.query(Artefact).filter(Artefact.id == artefact_id).first()

    def get_latest_by_run(self, run_id: int) -> Optional[Artefact]:
        return (
            self.db.query(Artefact)
            .filter(Artefact.run_id == run_id)
            .order_by(Artefact.version.desc())
            .first()
        )

    def create(
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
        self.db.refresh(artefact)
        return artefact
