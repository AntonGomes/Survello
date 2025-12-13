from __future__ import annotations

from threading import Thread
from queue import SimpleQueue

from app.core.logging import logger
from app.models.orm import JobStatus
from app.prompts.dilaps_input import DILAPS_INPUT
from app.prompts.system import SYSTEM_PROMPT
from app.utils.document_handler import prepare, ConversionError
from app.utils.files import extract_comments

# Imported from our new service structure
from app.services.job_repository import JobRepository
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService


class ProcessingOrchestrator:
    """
    Coordinates doc generation. Updates DB state for polling (Async Pattern).
    """

    def __init__(
        self,
        job_id: str,
        job_repo: JobRepository,
        storage_service: StorageService,
        openai_service: OpenAIService,
    ) -> None:
        self.job_id = job_id
        self.job_repo = job_repo
        self.storage = storage_service
        self.openai_service = openai_service

    def run(self) -> None:
        logger.info("Starting orchestrator for job_id=%s", self.job_id)

        try:
            # 1. Fetch Job Metadata
            job = self.job_repo.get_job(self.job_id)
            if not job:
                logger.error("Job not found")
                return

            template_doc = self.job_repo.get_document(job.template_id)
            if not template_doc:
                logger.error("template doc not found")
                self.job_repo.append_log(
                    self.job_id, "ERROR: Template document not found"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)
                return

            self.job_repo.update_status(self.job_id, JobStatus.running)
            self.job_repo.append_log(self.job_id, "Job started")

            # Set initial progress to 33% (assuming S3 upload is done)
            self.job_repo.update_progress(self.job_id, 33)

            # 2. Download & Prepare Files
            try:
                # Download raw bytes
                logger.info("Downloading files from s3")
                self.job_repo.append_log(self.job_id, "Downloading files...")
                template_tuple = self.storage.get_file_bytes(template_doc.file_url)
                context_files = [
                    self.storage.get_file_bytes(url) for url in job.context_s3_urls
                ]

                # Convert to PDF/Images
                logger.info("Preparing files")
                self.job_repo.append_log(
                    self.job_id, "Converting files to PDF/Images..."
                )

                def _log_handler(msg: str):
                    logger.info(msg)
                    self.job_repo.append_log(self.job_id, msg)

                def _prepare_progress_handler(done: int, total: int):
                    # Map 0-100% of preparation to 33-66% of total job
                    if total > 0:
                        # progress = 33 + (done / total * 33)
                        p = 33 + int((done / total) * 33)
                        self.job_repo.update_progress(self.job_id, p)

                job_file_bundle = prepare(
                    template=template_tuple,
                    context_files=context_files,
                    on_log=_log_handler,
                    on_progress=_prepare_progress_handler,
                )
            except (ConversionError, Exception) as exc:
                logger.exception("Preparation failed for job_id=%s", self.job_id)
                self.job_repo.append_log(
                    self.job_id, f"ERROR: Preparation failed: {exc}"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)
                return

            # 3. Upload to OpenAI (Async Progress)
            logger.info("Uploading files to OpenAI")
            self.job_repo.append_log(self.job_id, "Uploading files to OpenAI...")
            upload_queue: SimpleQueue[float | str | None] = SimpleQueue()
            upload_result_holder = {}

            def _do_upload():
                try:
                    upload_result_holder["bundle"] = self.openai_service.upload_bundle(
                        job_id=self.job_id,
                        bundle=job_file_bundle,
                        on_progress=lambda done, total: upload_queue.put(
                            100 * done / total if total else 100
                        ),
                    )
                    logger.debug("Succesful upload")
                    upload_queue.put(None)  # Signal done
                except Exception as e:
                    logger.debug("unsuccesful upload", e)
                    upload_queue.put(f"ERROR:{e}")
                    upload_queue.put(None)

            Thread(target=_do_upload, daemon=True).start()

            # Stream upload progress
            while True:
                msg = upload_queue.get()
                if msg is None:
                    break
                if isinstance(msg, str) and msg.startswith("ERROR:"):
                    error_msg = msg.split(":", 1)[1]
                    self.job_repo.append_log(
                        self.job_id, f"ERROR: Upload failed: {error_msg}"
                    )
                    self.job_repo.update_status(self.job_id, JobStatus.failed)
                    return
                if isinstance(msg, (int, float)):
                    # Map 0-100% of upload to 66-100% of total job
                    # progress = 66 + (msg / 100 * 34)
                    p = 66 + int((msg / 100) * 34)
                    # Cap at 99 until we are truly done with everything before generation
                    p = min(p, 99)
                    logger.debug(f"Uploading files: {msg}% (Total: {p}%)")
                    self.job_repo.update_progress(self.job_id, p)

            if "bundle" not in upload_result_holder:
                self.job_repo.append_log(self.job_id, "ERROR: Upload failed silently.")
                self.job_repo.update_status(self.job_id, JobStatus.failed)
                return

            # Mark as 100% complete for the "setup" phase, now entering generation
            self.job_repo.update_progress(self.job_id, 100)

            client_container_bundle = upload_result_holder["bundle"]

            # 4. Stream Model Response
            logger.info("Stream model repsonse")
            self.job_repo.append_log(self.job_id, "Generating document with OpenAI...")
            try:
                stream = self.openai_service.stream_model_response(
                    container_bundle=client_container_bundle,
                    system_prompt=SYSTEM_PROMPT,
                    user_input=DILAPS_INPUT,
                )

                for chunk in stream:
                    # Check for various chunk types (Text vs Code)
                    output_text = ""

                    if getattr(chunk, "type", "") == "response.output_text.done":
                        output_text = chunk.text
                    elif (
                        getattr(chunk, "type", "")
                        == "response.code_interpreter_call_code.done"
                    ):
                        output_text = extract_comments(chunk.code)

                    if output_text:
                        logger.debug(f"Model resonse: {output_text}")
                        self.job_repo.append_log(self.job_id, output_text)

            except Exception as exc:
                logger.exception("Model stream error job_id=%s", self.job_id)
                self.job_repo.append_log(
                    self.job_id, f"ERROR: Model stream error: {exc}"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)
                return

            # 5. Fetch Final File & Persist
            try:
                logger.info("Fetching final file for job_id=%s", self.job_id)
                self.job_repo.append_log(self.job_id, "Finalizing document...")

                file_data = self.openai_service.fetch_generated_file(
                    client_container_bundle.container_id,
                    client_container_bundle.template_container_file_id,
                )

                storage_key = f"outputs/{self.job_id}/{job_file_bundle.template.name}"
                self.storage.upload_file(storage_key, file_data)

                self.job_repo.create_output_document(
                    job=job, name=job_file_bundle.template.name, storage_key=storage_key
                )

                self.job_repo.append_log(self.job_id, "Job completed successfully")
                self.job_repo.update_status(self.job_id, JobStatus.completed)
                self.job_repo.update_progress(self.job_id, 100)

            except Exception as exc:
                logger.exception("Finalization failed for job_id=%s", self.job_id)
                self.job_repo.append_log(
                    self.job_id, f"ERROR: Finalization failed: {exc}"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)

        except Exception as e:
            logger.exception("Unexpected error in orchestrator job_id=%s", self.job_id)
            self.job_repo.append_log(self.job_id, f"ERROR: Unexpected error: {e}")
            self.job_repo.update_status(self.job_id, JobStatus.failed)
