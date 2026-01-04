from __future__ import annotations

import time
import uuid
from pathlib import PurePosixPath
from typing import List

from app.core.logging import logger

from app.core.enums import RunStatus, FileRole, ArtefactType
from app.schemas.common_schemas import InputImage, InputFile, UploadPayloadItem
from app.schemas.file_schemas import FileStore, FileCreate

from app.prompts.doc_gen_prompt import (
    DOC_GEN_SYSTEM_PROMPT_XLSX,
    DOC_GEN_SYSTEM_PROMPT_DOCX,
)

from app.utils.document_handler import (
    convert_to_pdf,
    file_type_to_mime_type,
    mime_type_to_file_type,
    get_template_summary,
)

from app.repositories.run_repo import RunRepository
from app.repositories.file_repo import FileRepository
from app.repositories.artefact_repo import ArtefactRepository
from app.services.storage import StorageService
import tokenize
from io import StringIO
from app.services.openai_service import OpenAIService


GPT_MODEL = "gpt-5.2-2025-12-11"


class DocGenOrchestrator:
    """
    Coordinates doc generation. Updates DB state for polling (Async Pattern).
    """

    def __init__(
        self,
        run_id: int,
        run_repo: RunRepository,
        file_repo: FileRepository,
        artefact_repo: ArtefactRepository,
        storage_service: StorageService,
        openai_service: OpenAIService,
    ) -> None:
        self.run_id = run_id
        self.run_repo = run_repo
        self.file_repo = file_repo
        self.artefact_repo = artefact_repo
        self.storage = storage_service
        self.openai_service = openai_service

    def run_process(self) -> None:
        start_time = time.time()
        logger.info(f"Starting orchestrator for run.id={self.run_id}")

        # Fetch fresh run object
        self.run = self.run_repo.get_by_id(self.run_id)
        if not self.run:
            logger.error(f"Run {self.run_id} not found")
            return

        try:
            # Stage 1: Preparation & Upload
            try:
                self.run_repo.update_status(self.run.id, RunStatus.UPLOADING)
                (
                    payload,
                    template_file,
                    template_summary,
                    llm_client_container_bundle,
                ) = self._prepare_files_and_payload()
            except Exception as e:
                raise RuntimeError(
                    "Failed during file preparation and upload stage"
                ) from e

            # Stage 2: Generation
            try:
                self.run_repo.update_status(self.run.id, RunStatus.GENERATING)
                self._stream_model_response(
                    payload,
                    template_file,
                    template_summary,
                    llm_client_container_bundle,
                )
            except Exception as e:
                raise RuntimeError("Failed during model generation stage") from e

            # Stage 3: Finalisation
            try:
                self.run_repo.update_status(self.run.id, RunStatus.FINALISING)
                self._finalize_artefact(
                    template_file, llm_client_container_bundle, start_time
                )
            except Exception as e:
                raise RuntimeError("Failed during artefact finalisation stage") from e

        except Exception as e:
            logger.error(f"Orchestration failed: {str(e)}", exc_info=True)
            self.run_repo.update_status(self.run.id, RunStatus.ERROR)

    def _prepare_files_and_payload(self):
        template_file = None
        template_file_with_bytes = None
        template_summary = None
        payload: List[UploadPayloadItem] = []

        dl_start = time.time()

        logger.info(f"Preparing files for run.id={self.run.id}")

        run_progress = 30  # initial progress after upload stage
        self.run_repo.update_progress(self.run.id, run_progress)

        run_files = [rf.file for rf in self.run.run_files]
        progress_delta = int(60 / len(run_files))

        for idx, file in enumerate(run_files):
            # convert file to dto
            file = FileStore.model_validate(file)

            # If template, fetch summary and bytes
            if file.role == FileRole.TEMPLATE:
                template_file_type = mime_type_to_file_type(file.mime_type)
                if template_file_type not in ArtefactType._value2member_map_:
                    raise ValueError(
                        f"Unsupported template file type: {template_file_type}"
                    )

                logger.info(f"Fetching template bytes: run.id={self.run.id}")
                template_file_with_bytes = self.storage.get_file_with_bytes(file)
                template_summary = get_template_summary(template_file_with_bytes)

            else:
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
                    file=file,
                    inline=True,
                )

                # Now add to payload
                if file.mime_type == "application/pdf":
                    payload.append(InputFile(file_url=presigned_url))
                else:
                    payload.append(InputImage(image_url=presigned_url))

            self.run_repo.update_progress(
                self.run.id, run_progress + (idx + 1) * progress_delta
            )

        dl_duration = time.time() - dl_start
        logger.info(
            f"Downloaded {len(run_files) + 1} files. Duration: {dl_duration:.2f}s run.id={self.run.id}"
        )

        # 1.3 Upload template to OpenAI
        logger.info(f"Uploading template to OpenAI for run.id={self.run.id}")
        llm_client_container_bundle = self.openai_service.upload_template(
            run_id=str(self.run.id),
            template_with_bytes=template_file_with_bytes,
        )
        del template_file_with_bytes.data
        template_file = template_file_with_bytes
        logger.info(f"Template upload successful for run.id={self.run.id}")

        return payload, template_file, template_summary, llm_client_container_bundle

    def _stream_model_response(
        self, payload, template_file, template_summary, llm_client_container_bundle
    ):
        logger.info(f"Stream model response for run.id={self.run.id}")

        def extract_comments(code: str) -> List[str]:
            """Extract # comments and docstrings from Python code."""
            comments: list[str] = []
            # Extract # comments using the tokenizer
            tok = tokenize.generate_tokens(StringIO(code).readline)
            for ttype, tstring, *_ in tok:
                if ttype == tokenize.COMMENT:
                    comments.append(tstring.lstrip("#").strip())
            return comments

        DOC_GEN_SYSTEM_PROMPT = (
            DOC_GEN_SYSTEM_PROMPT_XLSX
            if mime_type_to_file_type(template_file.mime_type) == ArtefactType.XLSX
            else DOC_GEN_SYSTEM_PROMPT_DOCX
        )

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
            model_responses = []
            if getattr(chunk, "type", "") == "response.output_text.done":
                model_responses = [chunk.text]
            elif (
                getattr(chunk, "type", "") == "response.code_interpreter_call_code.done"
            ):
                model_responses = extract_comments(chunk.code)
            if model_responses:
                logger.debug(f"Update model response: run.id={self.run.id}")
                for response in model_responses:
                    logger.debug(response)  # DEBUG please remove in prod
                self.run_repo.update_model_responses(self.run.id, model_responses)

        gen_duration = time.time() - gen_start
        logger.info(
            f"Generation completed. Duration: {gen_duration:.2f}s: run.id={self.run.id}"
        )

    def _finalize_artefact(
        self, template_file, llm_client_container_bundle, start_time
    ):
        logger.info(f"Fetching artefact file content for run.id={self.run.id}")
        artefact_bytes = self.openai_service.fetch_generated_file(
            llm_client_container_bundle.container_id,
            llm_client_container_bundle.template_container_file_id,
        )

        template_file_type = mime_type_to_file_type(template_file.mime_type)

        artefact_name = f"field_clerk_artefact_{uuid.uuid4()}.{template_file_type}"
        artefact_storage_key = str(
            PurePosixPath(template_file.storage_key).parent / artefact_name
        )

        artefact_file_in = FileCreate(
            # org_id=self.run.org_id,
            owner_user_id=self.run.created_by_user_id,
            storage_key=artefact_storage_key,
            file_name=artefact_name,
            mime_type=file_type_to_mime_type(template_file_type),
            role=FileRole.ARTEFACT,
        )
        artefact_file_orm = self.file_repo.create(
            file_in=artefact_file_in,
            commit=False,  # Don't commit in case upload fails
        )

        artefact_file = FileStore.model_validate(artefact_file_orm)
        artefact_file.data = artefact_bytes
        self.storage.upload_file(artefact_file)

        logger.info(f"Creating preview for run.id={self.run.id}")
        tmp_pdf_preview_file = convert_to_pdf(artefact_file)  # FIXME: this has no id
        tmp_pdf_preview_file.storage_key = "preview_" + tmp_pdf_preview_file.storage_key
        tmp_pdf_preview_file.file_name = "preview_" + tmp_pdf_preview_file.file_name

        pdf_preview_file_in = FileCreate(
            # org_id=self.run.org_id,
            owner_user_id=self.run.created_by_user_id,
            storage_key=tmp_pdf_preview_file.storage_key,
            file_name=tmp_pdf_preview_file.file_name,
            mime_type=tmp_pdf_preview_file.mime_type,
            role=FileRole.PREVIEW_PDF,
        )
        pdf_preview_file = self.file_repo.create(  # new id is created by db here
            file_in=pdf_preview_file_in,
            commit=False,  # Don't commit in case upload fails
        )
        pdf_preview_file.data = tmp_pdf_preview_file.data

        self.storage.upload_file(pdf_preview_file)

        logger.info(f"Creating artefact record for run.id={self.run.id}")
        self.artefact_repo.create(
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
