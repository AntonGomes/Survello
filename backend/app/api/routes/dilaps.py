from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import joinedload
from sqlmodel import Field, select

from app.api.deps import CurrentUserDep, DBDep, DilapsServicesDep
from app.models.dilaps_model import (
    DilapsItem,
    DilapsItemCreate,
    DilapsItemRead,
    DilapsItemUpdate,
    DilapsRun,
    DilapsRunCreate,
    DilapsRunRead,
    DilapsSection,
    DilapsSectionFileLink,
    DilapsSectionRead,
    DilapsSectionUpdate,
)
from app.models.file_model import File, FileRead
from app.models.run_model import Run, RunCreate
from app.orchestrators.dilaps import execute
from app.services.xlsx_export import export_dilaps

router = APIRouter()


@router.post("/", response_model=DilapsRunRead, operation_id="createDilapsRun")
def create_dilaps_run(
    body: DilapsRunCreate,
    background_tasks: BackgroundTasks,
    current_user: CurrentUserDep,
    db: DBDep,
    services: DilapsServicesDep,
) -> DilapsRun:
    context_files = _fetch_files(db, body.context_file_ids)

    run_create = RunCreate(
        template_file_id=body.template_file_id,
        context_file_ids=body.context_file_ids,
        job_id=body.job_id,
    )
    db_run = Run.model_validate(
        run_create,
        update={
            "org_id": current_user.org_id,
            "created_by_user_id": current_user.id,
        },
    )
    db_run.context_files = context_files
    db.add(db_run)
    db.flush()

    dilaps_run = DilapsRun(
        run_id=db_run.id,
        property_address=body.property_address,
        lease_summary=body.lease_summary,
        org_id=current_user.org_id,
        created_by_user_id=current_user.id,
        job_id=body.job_id,
    )
    db.add(dilaps_run)
    db.commit()
    db.refresh(dilaps_run)

    background_tasks.add_task(
        execute,
        dilaps_run,
        db,
        services.storage,
        services.vision,
        services.embedding,
    )

    return dilaps_run


def _fetch_files(db: DBDep, file_ids: list[int]) -> list[File]:
    files: list[File] = []
    for fid in file_ids:
        f = db.get(File, fid)
        if not f:
            raise HTTPException(404, f"File {fid} not found")
        files.append(f)
    return files


@router.get(
    "/{dilaps_id}",
    response_model=DilapsRunRead,
    operation_id="readDilapsRun",
)
def read_dilaps_run(
    dilaps_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsRun:
    dilaps_run = db.get(DilapsRun, dilaps_id)
    if not dilaps_run:
        raise HTTPException(404, "Dilaps run not found")
    if dilaps_run.org_id != current_user.org_id:
        raise HTTPException(403, "Not authorized")
    return dilaps_run


class SectionWithItems(DilapsSectionRead):
    items: list[DilapsItemRead] = Field(default_factory=list)
    image_files: list[FileRead] = Field(default_factory=list)


@router.get(
    "/{dilaps_id}/sections",
    response_model=list[SectionWithItems],
    operation_id="readDilapsSections",
)
def read_dilaps_sections(
    dilaps_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> list[SectionWithItems]:
    dilaps_run = db.get(DilapsRun, dilaps_id)
    if not dilaps_run:
        raise HTTPException(404, "Dilaps run not found")
    if dilaps_run.org_id != current_user.org_id:
        raise HTTPException(403, "Not authorized")

    sections = db.exec(
        select(DilapsSection)
        .where(DilapsSection.dilaps_run_id == dilaps_id)
        .options(joinedload(DilapsSection.items))
        .options(joinedload(DilapsSection.files))
        .order_by(DilapsSection.sort_order)
    ).unique().all()

    return [
        SectionWithItems(
            id=s.id,
            dilaps_run_id=s.dilaps_run_id,
            name=s.name,
            sort_order=s.sort_order,
            sheet_name=s.sheet_name,
            items=[DilapsItemRead.model_validate(i) for i in s.items],
            image_files=[FileRead.model_validate(f) for f in s.files],
        )
        for s in sections
    ]


@router.patch(
    "/sections/{section_id}",
    response_model=DilapsSectionRead,
    operation_id="updateDilapsSection",
)
def update_dilaps_section(
    section_id: int,
    body: DilapsSectionUpdate,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsSection:
    section = _get_authorized_section(section_id, db, current_user)
    update_data = body.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(section, key, val)
    db.commit()
    db.refresh(section)
    return section


def _get_authorized_section(
    section_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsSection:
    section = db.get(DilapsSection, section_id)
    if not section:
        raise HTTPException(404, "Section not found")
    dilaps_run = db.get(DilapsRun, section.dilaps_run_id)
    if not dilaps_run or dilaps_run.org_id != current_user.org_id:
        raise HTTPException(403, "Not authorized")
    return section


@router.patch(
    "/items/{item_id}",
    response_model=DilapsItemRead,
    operation_id="updateDilapsItem",
)
def update_dilaps_item(
    item_id: int,
    body: DilapsItemUpdate,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsItem:
    item = _get_authorized_item(item_id, db, current_user)
    update_data = body.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(item, key, val)
    db.commit()
    db.refresh(item)
    return item


def _get_authorized_item(
    item_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsItem:
    item = db.get(DilapsItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    section = db.get(DilapsSection, item.section_id)
    if not section:
        raise HTTPException(404, "Section not found")
    dilaps_run = db.get(DilapsRun, section.dilaps_run_id)
    if not dilaps_run or dilaps_run.org_id != current_user.org_id:
        raise HTTPException(403, "Not authorized")
    return item


@router.post(
    "/sections/{section_id}/items",
    response_model=DilapsItemRead,
    operation_id="createDilapsItem",
)
def create_dilaps_item(
    section_id: int,
    body: DilapsItemCreate,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsItem:
    section = _get_authorized_section(section_id, db, current_user)

    max_order = max((i.sort_order for i in section.items), default=-1)
    item = DilapsItem(
        section_id=section.id,
        item_number=body.item_number or "",
        lease_clause=body.lease_clause,
        want_of_repair=body.want_of_repair,
        remedy=body.remedy,
        unit=body.unit,
        quantity=body.quantity,
        rate=body.rate,
        cost=body.cost,
        sort_order=max_order + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/items/{item_id}",
    operation_id="deleteDilapsItem",
)
def delete_dilaps_item(
    item_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> dict[str, str]:
    item = _get_authorized_item(item_id, db, current_user)
    db.delete(item)
    db.commit()
    return {"status": "deleted"}


class MergeSectionsBody(DilapsSectionUpdate):
    source_id: int
    target_id: int


@router.post(
    "/{dilaps_id}/merge-sections",
    response_model=DilapsSectionRead,
    operation_id="mergeDilapsSections",
)
def merge_sections(
    dilaps_id: int,
    body: MergeSectionsBody,
    db: DBDep,
    current_user: CurrentUserDep,
) -> DilapsSection:
    source = _get_authorized_section(body.source_id, db, current_user)
    target = _get_authorized_section(body.target_id, db, current_user)

    max_order = max((i.sort_order for i in target.items), default=-1)
    for item in source.items:
        item.section_id = target.id
        max_order += 1
        item.sort_order = max_order

    _move_file_links(source.id, target.id, db)
    db.delete(source)
    db.commit()
    db.refresh(target)
    return target


def _move_file_links(
    source_id: int | None,
    target_id: int | None,
    db: DBDep,
) -> None:
    links = db.exec(
        select(DilapsSectionFileLink).where(
            DilapsSectionFileLink.section_id == source_id
        )
    ).all()
    for link in links:
        link.section_id = target_id
    db.flush()


class SplitSectionBody(DilapsSectionUpdate):
    split_at_image_index: int


@router.post(
    "/sections/{section_id}/split",
    response_model=list[DilapsSectionRead],
    operation_id="splitDilapsSection",
)
def split_section(
    section_id: int,
    body: SplitSectionBody,
    db: DBDep,
    current_user: CurrentUserDep,
) -> list[DilapsSection]:
    section = _get_authorized_section(section_id, db, current_user)

    file_links = db.exec(
        select(DilapsSectionFileLink).where(
            DilapsSectionFileLink.section_id == section_id
        )
    ).all()

    split_idx = body.split_at_image_index
    if split_idx <= 0 or split_idx >= len(file_links):
        raise HTTPException(400, "Invalid split index")

    new_section = DilapsSection(
        dilaps_run_id=section.dilaps_run_id,
        name=f"{section.name} (split)",
        sort_order=section.sort_order + 1,
    )
    db.add(new_section)
    db.flush()

    for link in file_links[split_idx:]:
        link.section_id = new_section.id

    db.commit()
    db.refresh(section)
    db.refresh(new_section)
    return [section, new_section]


XLSX_MIME = (
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)


@router.post(
    "/{dilaps_id}/export",
    operation_id="exportDilaps",
)
def export_dilaps_xlsx(
    dilaps_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> Response:
    dilaps_run = db.get(DilapsRun, dilaps_id)
    if not dilaps_run:
        raise HTTPException(404, "Dilaps run not found")
    if dilaps_run.org_id != current_user.org_id:
        raise HTTPException(403, "Not authorized")

    xlsx_bytes = export_dilaps(dilaps_run, db)
    filename = f"dilaps_{dilaps_id}.xlsx"

    return Response(
        content=xlsx_bytes,
        media_type=XLSX_MIME,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
