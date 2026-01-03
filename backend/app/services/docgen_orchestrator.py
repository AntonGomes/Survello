from __future__ import annotations

import time
from pathlib import Path, PurePosixPath
from typing import List

from app.core.logging import logger

from app.models.orm import Run, RunStatus, FileRole, ArtefactType
from app.models.models import InputImage, InputFile, UploadPayloadItem

from app.prompts.doc_gen_prompt import (
    DOC_GEN_SYSTEM_PROMPT_XLSX,
    DOC_GEN_SYSTEM_PROMPT_DOCX,
)

from app.utils.document_handler import (
    convert_to_pdf,
    file_type_to_mime_type,
    get_template_summary,
)
from app.utils.files import extract_comments

from app.services.run_repository import RunRepository
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService


GPT_MODEL = "gpt-5.2-2025-12-11"


class DocGenOrchestrator:
    """
    Coordinates doc generation. Updates DB state for polling (Async Pattern).
    """

    def __init__(
        self,
        run: Run,
        run_repo: RunRepository,
        file_repo: FileRepository,
        artefact_repo: ArtefactRepository,
        storage_service: StorageService,
        openai_service: OpenAIService,
    ) -> None:
        self.run = run
        self.run_repo = run_repo
        self.file_repo = file_repo
        self.artefact_repo = artefact_repo
        self.storage = storage_service
        self.openai_service = openai_service

    def run_process(self) -> None:
        # ----------------------------------------
        # STEP 1: Setup - Upload Files & Prepare Payload
        # ----------------------------------------

        start_time = time.time()
        logger.info(f"Starting orchestrator for run.id={self.run.id}")

        self.run_repo.update_status(self.run.id, RunStatus.UPLOADING)
        self.run_repo.bump_upload_progress(
            self.run.id, 30
        )  # Initial bump to 30% because frontend uplaoded files to s3

        try:
            dl_start = time.time()
            logger.info(f"Preparing files for run.id={self.run.id}")

            payload: List[UploadPayloadItem] = []
            section_progress = 60
            run_files = self.run_repo.get_run_files(self.run.id)

            for idx, file in enumerate(run_files):
                progress = int(((idx + 1) / len(run_files)) * section_progress)
                self.run_repo.bump_upload_progress(self.run.id, progress)

                # If template, fetch summary and bytes
                if file.role == FileRole.TEMPLATE:
                    logger.info(f"Fetching template bytes: run.id={self.run.id}")
                    template_file = file
                    template_file_with_bytes = self.storage.get_file_with_bytes(file)
                    template_summary = get_template_summary(template_file_with_bytes)
                    continue

                # If invalid type for context, convert and reupload to storage
                if (
                    not file.mime_type == "application/pdf"
                    and not file.mime_type.startswith("image/")
                ):
                    logger.info(
                        f"Fetching context file bytes {idx + 1}/{len(run_files)}: run.id={self.run.id}"
                    )
                    file_with_bytes = self.storage.get_file_with_bytes(file)
                    pdf_conversion = convert_to_pdf(
                        file_with_bytes
                    )  # updated mime_type and storage key
                    self.storage.upload_file(pdf_conversion)
                    del pdf_conversion.data  # free memory
                    file = pdf_conversion

                # Generate presigned URL for OpenAI upload
                presigned_url = self.storage.generate_presigned_url(
                    operation="get_object",
                    key=file.storage_key,
                    content_type=file.mime_type,
                    inline=True,
                    filename=file.file_name,
                )

                # Now add to payload
                if file.mime_type == "application/pdf":
                    payload.append(InputFile(file_url=presigned_url))
                else:
                    payload.append(InputImage(image_url=presigned_url))

            dl_duration = time.time() - dl_start
            logger.info(
                f"Downloaded {len(run_files) + 1} files. Duration: {dl_duration:.2f}s run.id={self.run.id}"
            )
        except Exception:
            logger.error(
                f"File preperation failed for run.id={self.run.id}", exc_info=True
            )
            self.run_repo.update_status(self.run.id, RunStatus.ERROR)
            return

        # 1.3 Upload template to OpenAI
        try:
            logger.info(f"Uploading template to OpenAI for run.id={self.run.id}")
            llm_client_container_bundle = self.openai_service.upload_template(
                run_id=str(self.run.id),
                template_with_bytes=template_file_with_bytes,
            )
            self.run_repo.bump_upload_progress(self.run.id, 10)
            logger.info(f"Template upload successful for run.id={self.run.id}")
        except Exception:
            logger.error(
                f"Template upload failed for run.id={self.run.id}", exc_info=True
            )
            self.run_repo.update_status(self.run.id, RunStatus.ERROR)
            return

        # Mark as 100% complete for the "setup" phase, now entering generation
        self.run_repo.bump_upload_progress(self.run.id, 30)

        # ----------------------------------------
        # STEP 2: Stream Model Responses
        # ----------------------------------------
        logger.info(f"Stream model response for run.id={self.run.id}")

        template_file_type = Path(template_file.file_name).suffix.lower().lstrip(".")
        DOC_GEN_SYSTEM_PROMPT = (
            DOC_GEN_SYSTEM_PROMPT_XLSX
            if template_file_type == ArtefactType.XLSX
            else DOC_GEN_SYSTEM_PROMPT_DOCX
        )
        try:
            gen_start = time.time()
            stream = self.openai_service.stream_model_response(
                container_bundle=llm_client_container_bundle,
                payload=payload,
                system_prompt=DOC_GEN_SYSTEM_PROMPT.format(
                    template_string=template_summary
                ),
                user_input=f"The template file is called {llm_client_container_bundle.template_container_file_id}. ",
                model_name=GPT_MODEL,
            )

            for chunk in stream:
                output_text = ""
                if getattr(chunk, "type", "") == "response.output_text.done":
                    output_text = chunk.text
                elif (
                    getattr(chunk, "type", "")
                    == "response.code_interpreter_call_code.done"
                ):
                    output_text = extract_comments(chunk.code)
                if output_text:
                    logger.debug(f"Model response: {output_text} run.id={self.run.id}")
                    self.run_repo.update_model_responses(self.run.id, output_text)

            gen_duration = time.time() - gen_start
            logger.info(
                f"Generation completed. Duration: {gen_duration:.2f}s: run.id={self.run.id}"
            )

        except Exception:
            logger.error(f"Model stream error run.id={self.run.id}", exc_info=True)
            self.run_repo.update_status(self.run.id, RunStatus.ERROR)
            return

        # ----------------------------------------
        # STEP 3: Finalisation - Fetch Artefact & Create Preview
        # ----------------------------------------

        try:
            logger.info(f"Fetching artefact file content for run.id={self.run.id}")
            artefact_bytes = self.openai_service.fetch_generated_file(
                llm_client_container_bundle.container_id,
                llm_client_container_bundle.template_container_file_id,
            )

            artefact_name = f"field_clerk_artefact_{self.run.id}.{template_file_type}"
            artefact_storage_key = str(
                PurePosixPath(template_file.storage_key).parent / artefact_name
            )

            artefact_file = self.file_repo.create_file(
                # org_id=self.run.org_id,
                owner_user_id=self.run.created_by_user_id,
                storage_key=artefact_storage_key,
                file_name=artefact_name,
                mime_type=file_type_to_mime_type(template_file_type),
                role=FileRole.ARTEFACT,
                commit=False,  # Don't commit in case upload fails
            )

            artefact_file.data = artefact_bytes
            self.storage.upload_file(artefact_file)

            logger.info(f"Creating preview for run.id={self.run.id}")
            tmp_pdf_preview_file = convert_to_pdf(artefact_file) # FIXME: this has the same id as the input file, not good
            pdf_preview_file = self.file_repo.create_file( # new id is created by db here
                # org_id=self.run.org_id,
                owner_user_id=self.run.created_by_user_id,
                storage_key=tmp_pdf_preview_file.storage_key,
                file_name=tmp_pdf_preview_file.file_name,
                mime_type=tmp_pdf_preview_file.mime_type,
                role=FileRole.PREVIEW_PDF,
                commit=False,  # Don't commit in case upload fails
            )
            pdf_preview_file.data = tmp_pdf_preview_file.data
            
            self.storage.upload_file(pdf_preview_file)

            logger.info(f"Creating artefact record for run.id={self.run.id}")
            self.artefact_repo.create_artefact(
                # org_id=self.run.org_id,
                run_id=self.run.id,
                job_id=self.run.job_id,
                version=1,
                artefact_type=template_file_type,
                title="Generated Artefact",
                artefact_file_id=artefact_file.id,
                pdf_preview_file_id=pdf_preview_file.id,
            )

            self.run_repo.update_status(self.run.id, RunStatus.COMPLETED)

            total_duration = time.time() - start_time
            logger.info(
                f"Run completed successfully. Total Duration: {total_duration:.2f}s run.id={self.run.id}"
            )

        except Exception:
            logger.error(f"Finalisation failed for run.id={self.run.id}", exc_info=True)
            self.run_repo.update_status(self.run.id, RunStatus.ERROR)
