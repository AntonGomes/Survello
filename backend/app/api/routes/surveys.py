from fastapi import APIRouter, HTTPException, status
from sqlmodel import select, func
from sqlalchemy.orm import joinedload

from app.api.deps import DBDep, CurrentUserDep
from app.models.survey_model import (
    Survey,
    SurveyCreate,
    SurveyRead,
    SurveyUpdate,
    SurveySurveyorLink,
    SurveyorRead,
)
from app.models.file_model import File, FileRead
from app.models.job_model import Job
from app.models.user_model import User
from app.models.update_model import create_survey_created_update


router = APIRouter()


def _build_survey_read(survey: Survey, db) -> SurveyRead:
    """Build a SurveyRead with computed photo and file counts."""
    # Count photos (images)
    photo_count = (
        db.exec(
            select(func.count(File.id))
            .where(File.survey_id == survey.id)
            .where(File.mime_type.startswith("image/"))  # pyright: ignore
        ).first()
        or 0
    )

    # Count other files (non-images)
    file_count = (
        db.exec(
            select(func.count(File.id))
            .where(File.survey_id == survey.id)
            .where(~File.mime_type.startswith("image/"))  # pyright: ignore
        ).first()
        or 0
    )

    # Build surveyors list from the many-to-many relationship
    surveyors_list = [
        SurveyorRead(id=u.id, name=u.name)  # pyright: ignore
        for u in survey.surveyors
    ]

    survey_read = SurveyRead.model_validate(survey)
    survey_read.photo_count = photo_count
    survey_read.file_count = file_count
    survey_read.surveyors = surveyors_list
    return survey_read


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=SurveyRead,
    operation_id="createSurvey",
)
def create_survey(
    survey_in: SurveyCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> SurveyRead:
    """Create a new survey."""
    survey = Survey(
        org_id=current_user.org_id,
        job_id=survey_in.job_id,
        project_id=survey_in.project_id,
        conducted_date=survey_in.conducted_date,
        conducted_time=survey_in.conducted_time,
        conducted_by_user_id=survey_in.conducted_by_user_id or current_user.id,
        description=survey_in.description,
        site_notes=survey_in.site_notes,
        weather=survey_in.weather,
        notes=survey_in.notes,
        # Legacy: also set surveyor_id for backward compatibility
        surveyor_id=survey_in.conducted_by_user_id or current_user.id,
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)

    # Add surveyors (many-to-many relationship)
    if survey_in.surveyor_ids:
        for user_id in survey_in.surveyor_ids:
            # Verify user exists and belongs to same org
            user = db.get(User, user_id)
            if user and user.org_id == current_user.org_id:
                link = SurveySurveyorLink(survey_id=survey.id, user_id=user_id)
                db.add(link)
        db.commit()
        db.refresh(survey)

    # Add auto-update to the parent job
    job = db.get(Job, survey.job_id)
    if job:
        initials = (
            "".join(word[0].upper() for word in (current_user.name or "").split()[:2])
            or "??"
        )
        update_item = create_survey_created_update(
            author_id=current_user.id,  # pyright: ignore[reportArgumentType]
            author_name=current_user.name,
            author_initials=initials,
            survey_id=survey.id,
        )
        if job.updates is None:
            job.updates = []
        job.updates = [update_item.model_dump(mode="json")] + job.updates
        db.add(job)
        db.commit()

    # Reload with relationships
    result = db.exec(
        select(Survey)
        .where(Survey.id == survey.id)
        .options(
            joinedload(Survey.surveyor),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.conducted_by_user),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.project),  # pyright: ignore[reportArgumentType]
        )
    ).first()

    return _build_survey_read(result, db)


@router.get("/", response_model=list[SurveyRead], operation_id="readSurveys")
def read_surveys(
    current_user: CurrentUserDep,
    db: DBDep,
    job_id: int | None = None,
    project_id: int | None = None,
    offset: int = 0,
    limit: int = 100,
) -> list[SurveyRead]:
    """Retrieve surveys, optionally filtered by job or project."""
    query = (
        select(Survey)
        .where(Survey.org_id == current_user.org_id)
        .options(
            joinedload(Survey.surveyor),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.conducted_by_user),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.project),  # pyright: ignore[reportArgumentType]
        )
    )

    if job_id:
        query = query.where(Survey.job_id == job_id)
    if project_id:
        query = query.where(Survey.project_id == project_id)

    surveys = db.exec(query.offset(offset).limit(limit)).unique().all()

    return [_build_survey_read(survey, db) for survey in surveys]


@router.get("/{survey_id}", response_model=SurveyRead, operation_id="readSurvey")
def read_survey(
    survey_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> SurveyRead:
    """Get a specific survey by ID."""
    survey = db.exec(
        select(Survey)
        .where(Survey.id == survey_id)
        .options(
            joinedload(Survey.surveyor),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.conducted_by_user),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.project),  # pyright: ignore[reportArgumentType]
        )
    ).first()

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return _build_survey_read(survey, db)


@router.patch("/{survey_id}", response_model=SurveyRead, operation_id="updateSurvey")
def update_survey(
    survey_id: int,
    survey_in: SurveyUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> SurveyRead:
    """Update a survey."""
    survey = db.exec(
        select(Survey)
        .where(Survey.id == survey_id)
        .options(
            joinedload(Survey.surveyor),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.conducted_by_user),  # pyright: ignore[reportArgumentType]
            joinedload(Survey.project),  # pyright: ignore[reportArgumentType]
        )
    ).first()

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = survey_in.model_dump(exclude_unset=True)

    # Handle surveyor_ids separately (many-to-many relationship)
    surveyor_ids = update_data.pop("surveyor_ids", None)

    # Sync legacy surveyor_id with conducted_by_user_id
    if "conducted_by_user_id" in update_data:
        update_data["surveyor_id"] = update_data["conducted_by_user_id"]

    survey.sqlmodel_update(update_data)

    db.add(survey)
    db.commit()

    # Update surveyors if provided
    if surveyor_ids is not None:
        # Remove existing links
        db.exec(
            select(SurveySurveyorLink).where(SurveySurveyorLink.survey_id == survey_id)
        )
        existing_links = db.exec(
            select(SurveySurveyorLink).where(SurveySurveyorLink.survey_id == survey_id)
        ).all()
        for link in existing_links:
            db.delete(link)
        db.commit()

        # Add new links
        for user_id in surveyor_ids:
            user = db.get(User, user_id)
            if user and user.org_id == current_user.org_id:
                link = SurveySurveyorLink(survey_id=survey_id, user_id=user_id)
                db.add(link)
        db.commit()

    db.refresh(survey)

    return _build_survey_read(survey, db)


@router.delete(
    "/{survey_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    operation_id="deleteSurvey",
)
def delete_survey(
    survey_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> None:
    """Delete a survey."""
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(survey)
    db.commit()


@router.get(
    "/{survey_id}/files",
    response_model=list[FileRead],
    operation_id="readSurveyFiles",
)
def read_survey_files(
    survey_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> list[FileRead]:
    """Get all files attached to a survey."""
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    files = db.exec(select(File).where(File.survey_id == survey_id)).all()

    return files  # pyright: ignore[reportReturnType]
