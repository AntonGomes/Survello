from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm import Job, Document, JobStatus


class JobRepository:
    """Encapsulates all database access related to Jobs and Documents."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_job(self, job_id: str) -> Optional[Job]:
        try:
            # Handle string validation here or let UUID throw
            uid = uuid.UUID(job_id)
        except ValueError:
            return None
        return self.db.query(Job).filter(Job.id == uid).first()

    def get_document(self, doc_id: uuid.UUID) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == doc_id).first()

    def update_status(self, job_id: str, status: JobStatus) -> None:
        job = self.get_job(job_id)
        if job:
            job.status = status
            self.db.commit()

    def update_progress(self, job_id: str, progress: int) -> None:
        """Update the progress percentage of a job."""
        job = self.get_job(job_id)
        if job:
            job.progress = progress
            self.db.commit()

    def append_log(self, job_id: str, message: str) -> None:
        """Append a log message to the job's log list."""
        job = self.get_job(job_id)
        if job:
            # SQLAlchemy JSON mutation requires reassignment or flag_modified
            current_logs = list(job.logs)
            current_logs.append(message)
            job.logs = current_logs
            self.db.commit()

    def create_job(
        self,
        user_id: str,
        template_name: str,
        template_url: str,
        context_urls: list[str],
    ) -> Job:
        """Creates the Template Document and the Job record in a single transaction."""
        user_uuid = uuid.UUID(user_id)

        # 1. Create the Template Document record
        template_doc = Document(
            id=uuid.uuid4(),
            owner_user_id=user_uuid,
            name=template_name,
            file_url=template_url,
            mime_type="application/octet-stream",  # Inferred or generic
        )
        self.db.add(template_doc)
        self.db.flush()  # Flush to get the ID

        # 2. Create the Job record
        job = Job(
            id=uuid.uuid4(),
            user_id=user_uuid,
            template_id=template_doc.id,
            status=JobStatus.pending,
            context_s3_urls=context_urls,
        )
        self.db.add(job)
        self.db.commit()
        return job

    def create_output_document(
        self, job: Job, name: str, storage_key: str, mime_type: str = "application/pdf"
    ) -> Document:
        output_doc = Document(
            id=uuid.uuid4(),
            org_id=job.org_id,
            owner_user_id=job.user_id,
            name=name,
            file_url=storage_key,
            mime_type=mime_type,
        )
        self.db.add(output_doc)

        job.output_document_id = output_doc.id
        job.output_document_url = storage_key
        job.status = JobStatus.completed

        self.db.commit()
        return output_doc
