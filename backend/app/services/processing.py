from __future__ import annotations

from re import template
import uuid
import requests
from pathlib import Path
from typing import Generator, Iterable
from queue import SimpleQueue
from threading import Thread
from fastapi import HTTPException
from openai import OpenAI
from sse_starlette import JSONServerSentEvent
from sqlalchemy.orm import Session

from pydantic import BaseModel

from app.core.logging import logger
from app.core.settings import Settings

from app.models.orm import Document, Job, JobStatus
from app.models.models import ClientContainerBundle

from app.prompts.dilaps_input import DILAPS_INPUT
from app.prompts.system import SYSTEM_PROMPT

from app.services.storage import StorageBackend, get_storage_backend
from app.services.upload import UploadError, UploadService

from app.utils.files import (
    ConversionError,
    convert_to_pdf,
    extract_comments,
    is_document,
    is_image,
    is_open_xml,
    is_pdf,
)

class JobFileBundle(BaseModel):
    template_file: Path
    images: list[Path]
    documents: list[Path]

class DocumentProcessingException(Exception):
    """Raised when document processing fails."""

class DocumentPreparer:
    def __init__(self, template_dir: Path, context_dir: Path):
        self.template_dir = template_dir
        self.context_dir = context_dir

    def _collect_context_files(self) -> tuple[list[Path], list[Path]]:
        context_files = list(self.context_dir.glob("*"))
        images = [path for path in context_files if is_image(path)]
        documents = [path for path in context_files if is_document(path)]
        return images, documents

    def _convert_documents(self, documents: Iterable[Path]) -> list[Path]:
        pdfs = [doc for doc in documents if is_pdf(doc)]
        converted = [convert_to_pdf(doc) for doc in documents if is_open_xml(doc)]
        return pdfs + converted

    def prepare(self) -> JobFileBundle:
        # template file is the first file in the dir
        [template_file] = list(self.template_dir.iterdir())
        images, documents = self._collect_context_files()

        try:
            prepared_documents = self._convert_documents(documents)
        except ConversionError as exc:
            raise DocumentProcessingException(str(exc)) from exc

        return JobFileBundle(
            template_file=template_file,
            images=images,
            documents=prepared_documents,
        )


class ModelRunner:
    def __init__(
        self,
        client: OpenAI,
        settings: Settings,
        job_file_bundle: JobFileBundle,
        client_container_bundle: ClientContainerBundle,
        storage: StorageBackend,
        db: Session,
        job: Job,
    ):
        self.client = client
        self.settings = settings
        self.job_file_bundle = job_file_bundle
        self.client_container_bundle = client_container_bundle
        self.storage = storage
        self.db = db
        self.job = job
        self.job_id = str(job.id)

    def _fetch_file(self) -> bytes:
        fetch_url = (
            f"https://api.openai.com/v1/containers/"
            f"{self.client_container_bundle.container_id}/files/"
            f"{self.client_container_bundle.template_container_file_id}/content"
        )
        logger.debug("Fetching file with fetch_url %s", fetch_url)

        res = requests.get(
            fetch_url, 
            headers={"Authorization": f"Bearer {self.settings.openai_api_key}"}
        )

        if not res.ok:
            raise UploadError(
                f"Failed to fetch generated file: status={res.status_code} body={res.text}"
            )

        output_path = self.settings.output_temp_dir / self.job_file_bundle.template_file.name
        with open(output_path, "wb") as file_handle:
            file_handle.write(res.content)

        logger.debug("Successfully saved file to %s", output_path)

        # Upload generated file to storage and persist in DB
        storage_key = f"outputs/{self.job_id}/{output_path.name}"
        self.storage.upload_file(output_path, storage_key)

        output_doc = Document(
            id=uuid.uuid4(),
            org_id=self.job.org_id,
            owner_user_id=self.job.user_id,
            name=output_path.name,
            file_url=storage_key,
            mime_type="application/pdf",
        )
        self.db.add(output_doc)
        self.job.output_document_id = output_doc.id
        self.job.output_document_url = storage_key
        self.job.status = JobStatus.succeeded
        self.db.commit()

        return JSONServerSentEvent(event="completed", data=self.job_id).encode()

    def stream(self) -> Generator[bytes, None, None]:
        model_name = "gpt-5-2025-08-07"

        try:
            logger.info(
                "Opening model stream job_id=%s model=%s container=%s",
                self.job_id,
                model_name,
                self.client_container_bundle.container_id,
            )
            response = self.client.responses.create(
                model=model_name,
                instructions=SYSTEM_PROMPT,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": DILAPS_INPUT},
                            *self.client_container_bundle.payload,
                        ],
                    }
                ],
                tools=[
                    {
                        "type": "code_interpreter",
                        "container": self.client_container_bundle.container_id,
                    }
                ],
                tool_choice="required",
                stream=True,
            )
        except Exception as exc:
            logger.exception("Error creating model response for job_id=%s: %s", self.job_id, exc)
            yield JSONServerSentEvent(event="modelError", data=str(exc)).encode()
            return

        chunk_count = 0
        last_chunk_type: str | None = None
        last_output_preview = ""

        try:
            for chunk in response:
                chunk_count += 1
                last_chunk_type = getattr(chunk, "type", None)

                output_text = ""
                if chunk.type == "response.output_text.done":
                    output_text = chunk.text
                elif chunk.type == "response.code_interpreter_call_code.done":
                    output_text = extract_comments(chunk.code)

                if output_text:
                    last_output_preview = output_text[:200]
                    event = JSONServerSentEvent(event=chunk.type, data=output_text)
                    logger.debug("event: %s, data: %s", chunk.type, output_text)
                    yield event.encode()

            try:
                logger.info(
                    "Model stream complete; fetching file for job_id=%s after %s chunks (last=%s)",
                    self.job_id,
                    chunk_count,
                    last_chunk_type,
                )
                yield self._fetch_file()
            except Exception as exc:
                logger.exception("Failed to fetch generated file for job_id=%s: %s", self.job_id, exc)
                yield JSONServerSentEvent(event="modelError", data=str(exc)).encode()
        except Exception as exc:
            logger.exception(
                "Streaming error for job_id=%s after %s chunks (last=%s, preview=%r): %s",
                self.job_id,
                chunk_count,
                last_chunk_type,
                last_output_preview,
                exc,
            )
            yield JSONServerSentEvent(event="modelError", data=str(exc)).encode()


class ProcessingOrchestrator:
    def __init__(self, job_id: str, client: OpenAI, settings: Settings, db: Session):
        self.settings = settings
        self.client = client
        self.db = db
        self.job_id = job_id
        self.preparer = DocumentPreparer(
            template_dir=settings.template_temp_dir / job_id,
            context_dir=settings.context_temp_dir / job_id,
        )
        self.uploader = UploadService(
            client=self.client,
            api_key=self.settings.openai_api_key,
            container_prefix=self.settings.container_prefix,
        )
        self.storage = get_storage_backend(settings)

    def run(self) -> Generator[bytes, None, None]:
        logger.info("Starting processing for job_id=%s", self.job_id)

        job = self.db.query(Job).filter(Job.id == uuid.UUID(self.job_id)).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        template_doc = self.db.query(Document).filter(Document.id == job.template_id).first()
        if not template_doc:
            raise HTTPException(status_code=404, detail="Template not found")

        # Prepare local dirs (job scoped)
        job_template_dir = self.settings.template_temp_dir / self.job_id
        job_context_dir = self.settings.context_temp_dir / self.job_id
        job_template_dir.mkdir(parents=True, exist_ok=True)
        job_context_dir.mkdir(parents=True, exist_ok=True)

        # Download template
        template_path = job_template_dir / Path(template_doc.file_url).name
        self.storage.download_file(storage_key=template_doc.file_url, local_path=template_path)

        # Download context files
        for ctx_url in job.context_s3_urls:
            ctx_path = job_context_dir / Path(ctx_url).name
            self.storage.download_file(ctx_url, ctx_path)

        # Update status to running
        job.status = JobStatus.running
        self.db.commit()

        job_file_bundle = self.preparer.prepare()

        progress_queue: SimpleQueue[float | None] = SimpleQueue()
        upload_result: dict[str, ClientContainerBundle] = {}

        def on_progress(done: int, total: int) -> None:
            percent = 100 * done / total if total else 100
            progress_queue.put(percent)

        def do_upload() -> None:
            try:
                upload_result["bundle"] = self.uploader.upload(
                    job_id=self.job_id,
                    template=job_file_bundle.template_file,
                    images=job_file_bundle.images,
                    documents=job_file_bundle.documents,
                    on_progress=on_progress,
                )
            except Exception as exc:  # keep stream moving on failure
                progress_queue.put(("error", str(exc)))
            finally:
                progress_queue.put(None)

        Thread(target=do_upload, daemon=True).start()

        while True:
            progress = progress_queue.get()
            if progress is None:
                break
            if isinstance(progress, tuple) and progress[0] == "error":
                yield JSONServerSentEvent(event="modelError", data=progress[1]).encode()
                return
            yield JSONServerSentEvent(event="openaiUpload", data=progress).encode()

        client_container_bundle = upload_result["bundle"]

        runner = ModelRunner(
            client=self.client,
            settings=self.settings,
            job_file_bundle=job_file_bundle,
            client_container_bundle=client_container_bundle,
            storage=self.storage,
            db=self.db,
            job=job,
        )
        yield from runner.stream()
