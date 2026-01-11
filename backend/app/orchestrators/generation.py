"""Document generation orchestrator."""

from __future__ import annotations

import time
from pathlib import Path
from typing import cast, Iterable

import magic
from sqlmodel import Session

from app.core.logging import logger
from app.models.artefact_model import Artefact, ArtefactType
from app.models.file_model import File, FileRole
from app.models.run_model import Run, RunStatus
from app.prompts.doc_gen_prompt import (
    DOC_GEN_SYSTEM_PROMPT_DOCX,
    DOC_GEN_SYSTEM_PROMPT_XLSX,
)
from app.services.llm import BaseLLMService, LLMFile, LLMContainer
from app.services.storage import StorageService
from app.utils.conversion import to_pdf, to_summary, LLM_SUPPORTED_TYPES, XLSX_MIME


def execute(
    run: Run, db: Session, storage: StorageService, llm: BaseLLMService
) -> None:
    """
    Execute document generation pipeline.

    Flow: Load → Prepare files → Generate → Save artefact
    """
    # Verify run.id is present (should be for existing runs)
    if run.id is None:
        raise ValueError("Run ID is missing")

    # Ensure we have the latest status
    if run.status != RunStatus.IDLE:
        logger.warning(f"Run {run.id} already in status {run.status}")

    start = time.time()
    container: LLMContainer | None = None

    try:
        # Load
        template = run.template_file
        context_files = list(run.context_files)
        version = len(run.artefacts) + 1

        logger.info(
            f"[run={run.id}] Starting: template={template.file_name}, context={len(context_files)}"
        )

        # Prepare files
        logger.info(f"[run={run.id}] Preparing files for upload")
        run.status = RunStatus.UPLOADING
        db.commit()

        template_bytes = storage.get_file_data(template.storage_key)
        summary = to_summary(template_bytes, template.mime_type)

        # Convert unsupported context files to PDF
        llm_files: list[LLMFile] = []
        for f in context_files:
            if f.mime_type not in LLM_SUPPORTED_TYPES:
                data = storage.get_file_data(f.storage_key)
                pdf = to_pdf(data)
                f.storage_key = str(Path(f.storage_key).with_suffix(".pdf"))
                f.mime_type = "application/pdf"
                f.file_name = Path(f.file_name).with_suffix(".pdf").name
                storage.upload_file(f.storage_key, pdf)
                db.flush()

            url = storage.generate_presigned_url(
                "get_object", f.storage_key, f.mime_type, f.file_name, inline=True
            )
            llm_files.append(LLMFile(url=url, name=f.file_name))
            
            # Initialize if None
            if run.upload_progress is None:
                run.upload_progress = 0
                
            run.upload_progress += int(
                60 / len(context_files) + 1
            )  # incremental progress up to 90%
            db.commit()

        # Upload template to LLM
        container = llm.upload_template(template_bytes, template.file_name, str(run.id))
        run.upload_progress = 100

        # Generate
        logger.info(f"[run={run.id}] Generating document")
        run.status = RunStatus.GENERATING
        db.commit()

        prompt = (
            DOC_GEN_SYSTEM_PROMPT_XLSX
            if template.mime_type == XLSX_MIME
            else DOC_GEN_SYSTEM_PROMPT_DOCX
        )
        system = prompt.format(template_string=summary)
        user = f"Template file: {container.container_file_id}. Process with provided context."

        gen = llm.generate(container, llm_files, system, user)
        if gen:  # pyright: ignore[reportOptionalIterable]
            for msg in gen:
                run.model_responses = [*run.model_responses, msg]
                db.commit()

        # Finalize
        logger.info(f"[run={run.id}] Finalising artefact")
        run.status = RunStatus.FINALISING
        db.commit()

        artefact_bytes = llm.download(container)
        artefact = _create_artefact(db, storage, run, artefact_bytes, version)

        run.status = RunStatus.COMPLETED
        db.commit()

        logger.info(
            f"[run={run.id}] Complete in {time.time() - start:.1f}s, artefact={artefact.id}"
        )

    except Exception as e:
        logger.exception(f"[run={run.id}] Failed: {e}")
        if db_run := db.get(Run, run.id):
            db_run.status = RunStatus.ERROR
            db.commit()
        raise

    finally:
        if container:
            llm.cleanup(container)


def _create_artefact(
    db: Session, storage: StorageService, run: Run, data: bytes, version: int
) -> Artefact:
    """Create artefact + preview files and artefact record."""
    assert run.id is not None
    
    mime = magic.from_buffer(data, mime=True)
    ext = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
            ".docx",
            ArtefactType.DOCX,
        ),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
            ".xlsx",
            ArtefactType.XLSX,
        ),
    }.get(mime, (".bin", ArtefactType.DOCX))

    # Artefact file
    artefact_file = File(
        file_name=f"artefact_run_{run.id}_v{version}{ext[0]}",
        storage_key=f"{run.org_id}/artefacts/artefact_run_{run.id}_v{version}{ext[0]}",
        mime_type=mime,
        role=FileRole.ARTEFACT,
        size_bytes=len(data),
        org_id=run.org_id,
        run_id=run.id,
        job_id=run.job_id,
        uploaded_by_user_id=run.created_by_user_id,
    )

    # Preview file
    pdf_data = to_pdf(data)
    preview_file = File(
        file_name=f"preview_run_{run.id}_v{version}.pdf",
        storage_key=f"{run.org_id}/artefacts/preview_run_{run.id}_v{version}.pdf",
        mime_type="application/pdf",
        role=FileRole.PREVIEW_PDF,
        size_bytes=len(pdf_data),
        org_id=run.org_id,
        run_id=run.id,
        job_id=run.job_id,
        uploaded_by_user_id=run.created_by_user_id,
    )

    db.add(artefact_file)
    db.add(preview_file)
    db.flush()  # Get IDs
    assert artefact_file.id is not None
    assert preview_file.id is not None

    storage.upload_file(artefact_file.storage_key, data)
    storage.upload_file(preview_file.storage_key, pdf_data)

    artefact = Artefact(
        artefact_type=ext[1],
        title=f"Generated v{version}",
        version=version,
        org_id=run.org_id,
        job_id=run.job_id,
        run_id=run.id,
        file_id=artefact_file.id,
        preview_file_id=preview_file.id,
    )
    db.add(artefact)
    db.commit()

    return artefact
