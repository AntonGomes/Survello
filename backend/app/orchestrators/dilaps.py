from __future__ import annotations

import time
from dataclasses import dataclass

from sqlmodel import Session

from app.core.logging import logger
from app.models.dilaps_model import (
    DilapsItem,
    DilapsRun,
    DilapsSection,
    DilapsSectionFileLink,
    DilapsStatus,
    DilapsUnit,
)
from app.models.file_model import File
from app.prompts.dilaps_analysis import DILAPS_SECTION_ANALYSIS_PROMPT
from app.services.ai.gemini import GeminiVisionProvider
from app.services.ai.provider import EmbeddingProvider, VisionProvider
from app.services.image_sectioning import (
    compute_embeddings,
    is_image_file,
    merge_sections_by_llm,
    name_sections,
    section_images,
)
from app.services.storage import StorageService
from app.utils.conversion import LLM_SUPPORTED_TYPES, to_pdf
from app.utils.few_shot_loader import load_examples

EMBED_START_PCT = 10
EMBED_END_PCT = 30
ANALYZE_START_PCT = 50
ANALYZE_RANGE_PCT = 45

UNIT_MAP = {
    "Sum": DilapsUnit.SUM,
    "m": DilapsUnit.METRE,
    "m²": DilapsUnit.METRE_SQ,
    "m2": DilapsUnit.METRE_SQ,
    "No": DilapsUnit.NUMBER,
}


def _update_status(
    dilaps_run: DilapsRun,
    db: Session,
    status: DilapsStatus,
    progress: int,
    message: str | None = None,
) -> None:
    dilaps_run.status = status
    dilaps_run.progress_pct = progress
    if message is not None:
        dilaps_run.status_message = message
    db.commit()


def _separate_files(
    context_files: list[File],
) -> tuple[list[File], list[File]]:
    images = [f for f in context_files if is_image_file(f)]
    documents = [f for f in context_files if not is_image_file(f)]
    return images, documents


def _extract_lease_clauses(
    documents: list[File],
    storage: StorageService,
    vision: VisionProvider,
) -> dict[str, str]:
    if not documents:
        return {}
    document_parts: list[tuple[bytes, str]] = []
    for f in documents:
        data = storage.get_file_data(f.storage_key)
        mime = f.mime_type or "application/pdf"
        if mime not in LLM_SUPPORTED_TYPES:
            logger.info(f"Converting {f.file_name} ({mime}) to PDF for LLM")
            data = to_pdf(data)
            mime = "application/pdf"
        document_parts.append((data, mime))
    return vision.extract_lease_clauses(document_parts)


def _format_lease_clauses(clauses: dict[str, str]) -> str:
    if not clauses:
        return "No lease clauses available."
    lines = [f"- {ref}: {text}" for ref, text in clauses.items()]
    return "Lease clauses:\n" + "\n".join(lines)


def _build_lease_context(
    dilaps_run: DilapsRun,
) -> str:
    parts = [f"Property: {dilaps_run.property_address}"]
    if dilaps_run.lease_summary:
        parts.append(f"Lease summary: {dilaps_run.lease_summary}")
    if dilaps_run.lease_clauses:
        parts.append(_format_lease_clauses(dilaps_run.lease_clauses))
    return "\n".join(parts)


def _create_section_records(
    dilaps_run: DilapsRun,
    image_groups: list[list[File]],
    section_names: list[str],
    db: Session,
) -> list[DilapsSection]:
    sections: list[DilapsSection] = []
    for idx, (group, name) in enumerate(zip(image_groups, section_names, strict=True)):
        section = DilapsSection(
            dilaps_run_id=dilaps_run.id,
            name=name,
            sort_order=idx,
        )
        db.add(section)
        db.flush()

        for f in group:
            link = DilapsSectionFileLink(
                section_id=section.id,
                file_id=f.id,
            )
            db.add(link)

        sections.append(section)

    db.commit()
    return sections


@dataclass
class SectionAnalysisContext:
    lease_context: str
    lease_clauses_text: str
    running_memory: str
    few_shot: str
    vision: VisionProvider
    storage: StorageService


def _analyze_single_section(
    section: DilapsSection,
    section_files: list[File],
    ctx: SectionAnalysisContext,
    db: Session,
) -> str:
    image_data = [ctx.storage.get_file_data(f.storage_key) for f in section_files]

    prompt = DILAPS_SECTION_ANALYSIS_PROMPT.format(
        lease_context=ctx.lease_context,
        lease_clauses=ctx.lease_clauses_text,
        running_memory=ctx.running_memory or "None yet.",
        few_shot_examples=ctx.few_shot,
    )

    context_msg = f"Section: {section.name} ({len(image_data)} images)"
    result = ctx.vision.analyze_section(image_data, prompt, context_msg)

    for idx, item in enumerate(result.items):
        unit = UNIT_MAP.get(item.unit, DilapsUnit.SUM)
        db_item = DilapsItem(
            section_id=section.id,
            item_number="",
            lease_clause=item.lease_clause,
            want_of_repair=item.want_of_repair,
            remedy=item.remedy,
            unit=unit,
            quantity=item.quantity,
            rate=item.rate,
            cost=item.cost,
            sort_order=idx,
        )
        db.add(db_item)

    db.commit()
    return result.memory_update


def _renumber_items(
    dilaps_run: DilapsRun,
    db: Session,
) -> None:
    db.refresh(dilaps_run)
    major = 1
    for section in dilaps_run.sections:
        for idx, item in enumerate(section.items):
            item.item_number = f"{major}.{idx + 1:02d}"
        major += 1
    db.commit()


def _analyze_all_sections(
    dilaps_run: DilapsRun,
    sections: list[DilapsSection],
    image_groups: list[list[File]],
    ctx: SectionAnalysisContext,
    db: Session,
) -> None:
    total_sections = len(sections)
    for idx, (section, group) in enumerate(zip(sections, image_groups, strict=True)):
        progress = ANALYZE_START_PCT + int(
            ANALYZE_RANGE_PCT * idx / max(total_sections, 1)
        )
        dilaps_run.current_section = idx + 1
        img_count = len(group)
        step_label = (
            f"Inspecting {section.name} — "
            f"{img_count} images "
            f"({idx + 1} of {total_sections})..."
        )
        _update_status(
            dilaps_run,
            db,
            DilapsStatus.ANALYZING,
            progress,
            message=step_label,
        )

        memory_update = _analyze_single_section(
            section,
            group,
            ctx,
            db,
        )
        ctx.running_memory += f"\n{section.name}: {memory_update}"


def execute(
    dilaps_run: DilapsRun,
    db: Session,
    storage: StorageService,
    vision: VisionProvider,
    embedding: EmbeddingProvider,
) -> None:
    assert dilaps_run.id is not None
    start = time.time()

    try:
        run = dilaps_run.run
        context_files = list(run.context_files)
        images, documents = _separate_files(context_files)

        logger.info(
            f"[dilaps={dilaps_run.id}] Starting: "
            f"{len(images)} images, {len(documents)} docs"
        )

        _update_status(
            dilaps_run,
            db,
            DilapsStatus.EMBEDDING,
            EMBED_START_PCT,
            message=f"Processing {len(images)} survey images...",
        )

        embed_range = EMBED_END_PCT - EMBED_START_PCT

        def on_embed_progress(done: int, total: int) -> None:
            pct = EMBED_START_PCT + int(embed_range * done / max(total, 1))
            _update_status(
                dilaps_run,
                db,
                DilapsStatus.EMBEDDING,
                pct,
                message=f"Processing image {done} of {total}...",
            )

        embeddings = compute_embeddings(
            images,
            storage,
            embedding,
            db,
            on_progress=on_embed_progress,
        )
        _update_status(
            dilaps_run,
            db,
            DilapsStatus.EMBEDDING,
            EMBED_END_PCT,
            message="Finished processing your images",
        )

        _update_status(
            dilaps_run,
            db,
            DilapsStatus.SECTIONING,
            40,
            message="Grouping photos by area of the property...",
        )
        image_groups = section_images(images, embeddings, storage)
        _update_status(
            dilaps_run,
            db,
            DilapsStatus.SECTIONING,
            44,
            message=f"Naming {len(image_groups)} areas...",
        )
        section_names = name_sections(image_groups, vision, storage)
        image_groups, section_names = merge_sections_by_llm(
            image_groups, section_names, vision, storage
        )
        sections = _create_section_records(dilaps_run, image_groups, section_names, db)
        _update_status(
            dilaps_run,
            db,
            DilapsStatus.SECTIONING,
            50,
            message=f"Identified {len(sections)} areas of the property",
        )
        dilaps_run.total_sections = len(sections)
        db.commit()

        _update_status(
            dilaps_run,
            db,
            DilapsStatus.SECTIONING,
            55,
            message="Reading lease clauses...",
        )
        dilaps_run.lease_clauses = _extract_lease_clauses(documents, storage, vision)
        db.commit()

        lease_context = _build_lease_context(dilaps_run)
        clauses_text = _format_lease_clauses(dilaps_run.lease_clauses or {})
        ctx = SectionAnalysisContext(
            lease_context=lease_context,
            lease_clauses_text=clauses_text,
            running_memory="",
            few_shot=load_examples(),
            vision=vision,
            storage=storage,
        )

        _analyze_all_sections(dilaps_run, sections, image_groups, ctx, db)
        _renumber_items(dilaps_run, db)
        dilaps_run.current_section = len(sections)
        _update_status(
            dilaps_run,
            db,
            DilapsStatus.COMPLETED,
            100,
            message="Your dilaps report is ready",
        )

        elapsed = time.time() - start
        logger.info(f"[dilaps={dilaps_run.id}] Complete in {elapsed:.1f}s")

    except Exception as e:
        logger.exception(f"[dilaps={dilaps_run.id}] Failed: {e}")
        dilaps_run.status = DilapsStatus.ERROR
        dilaps_run.error_message = str(e)
        db.commit()
        raise

    finally:
        if isinstance(vision, GeminiVisionProvider):
            vision.file_manager.cleanup()
