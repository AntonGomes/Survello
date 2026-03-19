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
    name_sections,
    section_images,
)
from app.services.storage import StorageService
from app.utils.few_shot_loader import load_examples

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
    total_sections: int | None = None,
    current_section: int | None = None,
) -> None:
    dilaps_run.status = status
    dilaps_run.progress_pct = progress
    if message is not None:
        dilaps_run.status_message = message
    if total_sections is not None:
        dilaps_run.total_sections = total_sections
    if current_section is not None:
        dilaps_run.current_section = current_section
    db.commit()


def _separate_files(
    context_files: list[File],
) -> tuple[list[File], list[File]]:
    images = [f for f in context_files if is_image_file(f)]
    documents = [f for f in context_files if not is_image_file(f)]
    return images, documents


def _build_lease_context(
    documents: list[File],
    storage: StorageService,
    dilaps_run: DilapsRun,
) -> str:
    parts = [f"Property: {dilaps_run.property_address}"]
    if dilaps_run.lease_summary:
        parts.append(f"Lease summary: {dilaps_run.lease_summary}")
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
            dilaps_run, db, DilapsStatus.EMBEDDING, 10,
            message="Reading and understanding your survey images...",
        )
        embeddings = compute_embeddings(images, storage, embedding, db)
        _update_status(
            dilaps_run, db, DilapsStatus.EMBEDDING, 30,
            message="Finished processing your images",
        )

        _update_status(
            dilaps_run, db, DilapsStatus.SECTIONING, 40,
            message="Grouping photos by area of the property...",
        )
        image_groups = section_images(images, embeddings, storage)
        section_names = name_sections(image_groups, vision, storage)
        sections = _create_section_records(dilaps_run, image_groups, section_names, db)
        _update_status(
            dilaps_run, db, DilapsStatus.SECTIONING, 50,
            message=f"Identified {len(sections)} areas of the property",
            total_sections=len(sections),
        )

        lease_context = _build_lease_context(documents, storage, dilaps_run)
        ctx = SectionAnalysisContext(
            lease_context=lease_context,
            running_memory="",
            few_shot=load_examples(),
            vision=vision,
            storage=storage,
        )

        total_sections = len(sections)
        for idx, (section, group) in enumerate(
            zip(sections, image_groups, strict=True)
        ):
            progress = 50 + int(45 * (idx / max(total_sections, 1)))
            _update_status(
                dilaps_run, db, DilapsStatus.ANALYZING, progress,
                message=f"Inspecting {section.name} ({idx + 1} of {total_sections})...",
                current_section=idx + 1,
            )

            memory_update = _analyze_single_section(
                section,
                group,
                ctx,
                db,
            )
            ctx.running_memory += f"\n{section.name}: {memory_update}"

        _renumber_items(dilaps_run, db)
        _update_status(
            dilaps_run, db, DilapsStatus.COMPLETED, 100,
            message="Your dilaps report is ready",
            current_section=total_sections,
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
