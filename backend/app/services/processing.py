from __future__ import annotations

from threading import Thread
from queue import SimpleQueue
import time
from pathlib import Path

from app.core.logging import logger
from app.models.orm import JobStatus
from app.prompts.dilaps_input import DILAPS_INPUT
from app.prompts.doc_gen_prompt import DOC_GEN_SYSTEM_PROMPT_XLSX, DOC_GEN_SYSTEM_PROMPT_DOCX
from app.utils.document_handler import prepare, convert_to_pdf, ConversionError
from app.utils.files import extract_comments

# Imported from our new service structure
from app.services.job_repository import JobRepository
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService

GPT_MODEL = "gpt-5.2-2025-12-11"

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
        start_time = time.time()
        logger.info(f"Starting orchestrator for job_id={self.job_id}")

        try:
            # 1. Fetch Job Metadata
            job = self.job_repo.get_job(self.job_id)
            if not job:
                logger.error(f"Job not found job_id={self.job_id}")
                return

            template_doc = self.job_repo.get_document(job.template_id)
            if not template_doc:
                logger.error(f"Template doc not found job_id={self.job_id}")
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
                dl_start = time.time()
                logger.info(f"Downloading files from s3 for job_id={self.job_id}")
                self.job_repo.append_log(self.job_id, "Downloading files...")
                
                logger.info(f"Downloading template: {template_doc.file_url} job_id={self.job_id}")
                template_tuple = self.storage.get_file_bytes(template_doc.file_url)
                
                context_files = []
                for idx, url in enumerate(job.context_s3_urls):
                    logger.info(f"Downloading context file {idx+1}/{len(job.context_s3_urls)}: {url} job_id={self.job_id}")
                    context_files.append(self.storage.get_file_bytes(url))
                
                dl_duration = time.time() - dl_start
                logger.info(f"Downloaded {len(context_files) + 1} files. Duration: {dl_duration:.2f}s job_id={self.job_id}")

                # Convert to PDF/Images
                prep_start = time.time()
                logger.info(f"Preparing files for job_id={self.job_id}")
                self.job_repo.append_log(
                    self.job_id, "Converting files to PDF/Images..."
                )

                def _log_handler(msg: str):
                    # logger.info(msg) # Reduced noise
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
                prep_duration = time.time() - prep_start
                logger.info(f"Files prepared. Duration: {prep_duration:.2f}s job_id={self.job_id}")
            except (ConversionError, Exception) as exc:
                logger.error(f"Preparation failed for job_id={self.job_id}", exc_info=True)
                self.job_repo.append_log(
                    self.job_id, f"ERROR: Preparation failed: {exc}"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)
                return

            # 3. Upload to OpenAI (Async Progress)
            logger.info(f"Uploading files to OpenAI for job_id={self.job_id}")
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
                    logger.info(f"Upload successful for job_id={self.job_id}")
                    upload_queue.put(None)  # Signal done
                except Exception as e:
                    logger.error(f"Unsuccessful upload for job_id={self.job_id}", exc_info=True)
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

            # 4. Stream Model Responses
            logger.info(f"Stream model response for job_id={self.job_id}")

            template_file_type = Path(job_file_bundle.template.name).suffix.lower() 
            DOC_GEN_SYSTEM_PROMPT = DOC_GEN_SYSTEM_PROMPT_XLSX if template_file_type == ".xlsx" else DOC_GEN_SYSTEM_PROMPT_DOCX
            try:
                gen_start = time.time()
                stream = self.openai_service.stream_model_response(
                    container_bundle=client_container_bundle,
                    system_prompt=DOC_GEN_SYSTEM_PROMPT.format(template_string=job_file_bundle.template_string),
                    user_input=f"The template file is called {client_container_bundle.template_container_file_id}. ",
                    model_name=GPT_MODEL,
                )

                token_est = 0
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
                        # logger.debug(f"Model resonse: {output_text}") # REMOVED
                        token_est += len(output_text) // 4
                        self.job_repo.append_log(self.job_id, output_text)
                
                gen_duration = time.time() - gen_start
                logger.info(f"Generation completed. Duration: {gen_duration:.2f}s. Est Tokens: {token_est} job_id={self.job_id}")

            except Exception as exc:
                logger.error(f"Model stream error job_id={self.job_id}", exc_info=True)
                self.job_repo.append_log(
                    self.job_id, f"ERROR: Model stream error: {exc}"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)
                return

            try:
                # 5.1 Fetch Final File & Persist
                logger.info(f"Fetching final file for job_id={self.job_id}")
                self.job_repo.append_log(self.job_id, "Finalizing document...")

                file_data = self.openai_service.fetch_generated_file(
                    client_container_bundle.container_id,
                    client_container_bundle.template_container_file_id,
                )

                storage_key = f"outputs/{self.job_id}/generated_document_0.{template_file_type}"
                self.storage.upload_file(storage_key, file_data)

                self.job_repo.create_output_document(
                    job=job, name=job_file_bundle.template.name, storage_key=storage_key
                )

                # 5.2 Create pdf preview and save
                logger.info(f"Creating preview for job_id={self.job_id}")
                self.job_repo.append_log(self.job_id, "Creating document preview...")

                pdf_data = convert_to_pdf(job_file_bundle.template.name, file_data)
                pdf_preview_storage_key = f"outputs/{self.job_id}/preview.pdf"
                self.storage.upload_file(pdf_preview_storage_key, pdf_data)

                self.job_repo.create_pdf_preview(
                    job=job, iteration=0, storage_key=pdf_preview_storage_key
                )

                # set jon as completed
                self.job_repo.append_log(self.job_id, "Job completed successfully")
                self.job_repo.update_status(self.job_id, JobStatus.completed)
                self.job_repo.update_progress(self.job_id, 100)
                
                total_duration = time.time() - start_time
                logger.info(f"Job completed successfully. Total Duration: {total_duration:.2f}s job_id={self.job_id}")

            except Exception as exc:
                logger.error(f"Finalization failed for job_id={self.job_id}", exc_info=True)
                self.job_repo.append_log(
                    self.job_id, f"ERROR: Finalization failed: {exc}"
                )
                self.job_repo.update_status(self.job_id, JobStatus.failed)

        except Exception as e:
            logger.error(f"Unexpected error in orchestrator job_id={self.job_id}", exc_info=True)
            self.job_repo.append_log(self.job_id, f"ERROR: Unexpected error: {e}")
            self.job_repo.update_status(self.job_id, JobStatus.failed)
