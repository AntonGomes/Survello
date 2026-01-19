from fastapi import APIRouter, HTTPException, status
from sqlmodel import select, func
from sqlalchemy.orm import joinedload

from app.api.deps import DBDep, CurrentUserDep
from app.models.survey_model import (
    Survey,
    SurveyCreate,
    SurveyRead,
    SurveyUpdate,
)
from app.models.file_model import File


router = APIRouter()


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
        date=survey_in.date,
        surveyor_id=survey_in.surveyor_id or current_user.id,
        notes=survey_in.notes,
    )
    db.add(survey)
    db.commit()

    # Reload with relationships
    result = db.exec(
        select(Survey)
        .where(Survey.id == survey.id)
        .options(joinedload(Survey.surveyor))  # pyright: ignore[reportArgumentType]
    ).first()

    # Get photo count
    photo_count = (
        db.exec(select(func.count(File.id)).where(File.survey_id == survey.id)).first()
        or 0
    )

    survey_read = SurveyRead.model_validate(result)
    survey_read.photo_count = photo_count
    return survey_read


@router.get("/", response_model=list[SurveyRead], operation_id="readSurveys")
def read_surveys(
    current_user: CurrentUserDep,
    db: DBDep,
    job_id: int | None = None,
    offset: int = 0,
    limit: int = 100,
) -> list[SurveyRead]:
    """Retrieve surveys, optionally filtered by job."""
    query = (
        select(Survey)
        .where(Survey.org_id == current_user.org_id)
        .options(joinedload(Survey.surveyor))  # pyright: ignore[reportArgumentType]
    )

    if job_id:
        query = query.where(Survey.job_id == job_id)

    surveys = db.exec(query.offset(offset).limit(limit)).unique().all()

    # Get photo counts for all surveys
    result = []
    for survey in surveys:
        photo_count = (
            db.exec(
                select(func.count(File.id)).where(File.survey_id == survey.id)
            ).first()
            or 0
        )
        survey_read = SurveyRead.model_validate(survey)
        survey_read.photo_count = photo_count
        result.append(survey_read)

    return result


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
        .options(joinedload(Survey.surveyor))  # pyright: ignore[reportArgumentType]
    ).first()

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    photo_count = (
        db.exec(select(func.count(File.id)).where(File.survey_id == survey_id)).first()
        or 0
    )

    survey_read = SurveyRead.model_validate(survey)
    survey_read.photo_count = photo_count
    return survey_read


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
        .options(joinedload(Survey.surveyor))  # pyright: ignore[reportArgumentType]
    ).first()

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = survey_in.model_dump(exclude_unset=True)
    survey.sqlmodel_update(update_data)

    db.add(survey)
    db.commit()
    db.refresh(survey)

    photo_count = (
        db.exec(select(func.count(File.id)).where(File.survey_id == survey_id)).first()
        or 0
    )

    survey_read = SurveyRead.model_validate(survey)
    survey_read.photo_count = photo_count
    return survey_read


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
