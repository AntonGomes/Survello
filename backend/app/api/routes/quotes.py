from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from sqlalchemy.orm import joinedload
from pydantic import BaseModel

from app.api.deps import DBDep, CurrentUserDep
from app.models.quote_model import (
    Quote,
    QuoteLine,
    QuoteCreate,
    QuoteLineCreate,
    QuoteRead,
    QuoteUpdate,
    QuoteStatus,
)
from app.models.lead_model import LeadStatus
from app.models.client_model import Client, ClientContact
from app.models.job_model import Job, JobStatus
from app.models.project_model import Project, FeeType, ProjectStatus


router = APIRouter()


class QuoteUpdateEntry(BaseModel):
    text: str


class ConvertQuoteResponse(BaseModel):
    job_id: int
    client_id: int | None = None  # Set if lead was converted to client


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=QuoteRead,
    operation_id="createQuote",
)
def create_quote(
    quote_in: QuoteCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> QuoteRead:
    """Create a new quote with optional quote lines (potential projects)."""
    # Validate that either client_id or lead_id is provided, but not both
    if quote_in.client_id and quote_in.lead_id:
        raise HTTPException(
            status_code=400, detail="Cannot set both client_id and lead_id"
        )

    quote = Quote(
        org_id=current_user.org_id,
        name=quote_in.name,
        estimated_fee=quote_in.estimated_fee,
        status=quote_in.status,
        expected_start_date=quote_in.expected_start_date,
        notes=quote_in.notes,
        client_id=quote_in.client_id,
        lead_id=quote_in.lead_id,
    )
    db.add(quote)
    db.flush()
    assert quote.id is not None

    # Create quote lines
    for line_in in quote_in.lines:
        line = QuoteLine(
            quote_id=quote.id,
            project_type_id=line_in.project_type_id,
            estimated_fee=line_in.estimated_fee,
            notes=line_in.notes,
        )
        db.add(line)

    db.commit()

    # Reload with relationships
    result = (
        db.exec(
            select(Quote)
            .where(Quote.id == quote.id)
            .options(
                joinedload(Quote.client),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
            )
        )
        .unique()
        .first()
    )

    return result  # pyright: ignore[reportReturnType]


@router.get("/", response_model=list[QuoteRead], operation_id="readQuotes")
def read_quotes(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = 100,
    status: QuoteStatus | None = None,
    client_id: int | None = None,
) -> list[QuoteRead]:
    """Retrieve quotes, optionally filtered by status or client."""
    query = (
        select(Quote)
        .where(Quote.org_id == current_user.org_id)
        .options(
            joinedload(Quote.client),  # pyright: ignore[reportArgumentType]
            joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
            joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
        )
    )

    if status:
        query = query.where(Quote.status == status)
    if client_id:
        query = query.where(Quote.client_id == client_id)

    quotes = db.exec(query.offset(offset).limit(limit)).unique().all()
    return quotes  # pyright: ignore[reportReturnType]


@router.get("/{quote_id}", response_model=QuoteRead, operation_id="readQuote")
def read_quote(
    quote_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> QuoteRead:
    """Get a specific quote by ID."""
    quote = (
        db.exec(
            select(Quote)
            .where(Quote.id == quote_id)
            .options(
                joinedload(Quote.client),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
            )
        )
        .unique()
        .first()
    )

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return quote  # pyright: ignore[reportReturnType]


@router.patch("/{quote_id}", response_model=QuoteRead, operation_id="updateQuote")
def update_quote(
    quote_id: int,
    quote_in: QuoteUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> QuoteRead:
    """Update a quote."""
    quote = (
        db.exec(
            select(Quote)
            .where(Quote.id == quote_id)
            .options(
                joinedload(Quote.client),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
            )
        )
        .unique()
        .first()
    )

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = quote_in.model_dump(exclude_unset=True)
    quote.sqlmodel_update(update_data)

    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote  # pyright: ignore[reportReturnType]


@router.delete(
    "/{quote_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    operation_id="deleteQuote",
)
def delete_quote(
    quote_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> None:
    """Delete a quote."""
    quote = db.get(Quote, quote_id)

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(quote)
    db.commit()


@router.post(
    "/{quote_id}/lines",
    status_code=status.HTTP_201_CREATED,
    response_model=QuoteRead,
    operation_id="addQuoteLine",
)
def add_quote_line(
    quote_id: int,
    line_in: QuoteLineCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> QuoteRead:
    """Add a line (potential project) to a quote."""
    quote = db.get(Quote, quote_id)

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    line = QuoteLine(
        quote_id=quote_id,
        project_type_id=line_in.project_type_id,
        estimated_fee=line_in.estimated_fee,
        notes=line_in.notes,
    )
    db.add(line)
    db.commit()

    # Reload with relationships
    result = (
        db.exec(
            select(Quote)
            .where(Quote.id == quote_id)
            .options(
                joinedload(Quote.client),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
            )
        )
        .unique()
        .first()
    )

    return result  # pyright: ignore[reportReturnType]


@router.post(
    "/{quote_id}/updates",
    response_model=QuoteRead,
    operation_id="addQuoteUpdate",
)
def add_quote_update(
    quote_id: int,
    update_entry: QuoteUpdateEntry,
    current_user: CurrentUserDep,
    db: DBDep,
) -> QuoteRead:
    """Add an update entry to a quote's timeline."""
    quote = (
        db.exec(
            select(Quote)
            .where(Quote.id == quote_id)
            .options(
                joinedload(Quote.client),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
            )
        )
        .unique()
        .first()
    )

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_update: dict[str, Any] = {
        "text": update_entry.text,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if quote.updates is None:
        quote.updates = []
    quote.updates = [new_update] + quote.updates

    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote  # pyright: ignore[reportReturnType]


@router.post(
    "/{quote_id}/convert",
    response_model=ConvertQuoteResponse,
    operation_id="convertQuote",
)
def convert_quote(
    quote_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ConvertQuoteResponse:
    """
    Convert a quote to a job. If the quote is linked to a lead,
    the lead is also converted to a client. Projects are created
    from quote lines.
    """
    quote = (
        db.exec(
            select(Quote)
            .where(Quote.id == quote_id)
            .options(
                joinedload(Quote.lead),  # pyright: ignore[reportArgumentType]
                joinedload(Quote.lines).joinedload(QuoteLine.project_type),  # pyright: ignore[reportArgumentType]
            )
        )
        .unique()
        .first()
    )

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if quote.converted_job_id:
        raise HTTPException(status_code=400, detail="Quote already converted")

    client_id = quote.client_id
    converted_client_id: int | None = None

    # If quote is linked to a lead, convert lead to client first
    if quote.lead_id and quote.lead:
        lead = quote.lead
        if lead.status != LeadStatus.CONVERTED:
            # Create client from lead
            client = Client(
                org_id=current_user.org_id,
                name=lead.name,
                address=None,
            )
            db.add(client)
            db.flush()
            assert client.id is not None
            client_id = client.id
            converted_client_id = client.id

            # Create contact if lead has contact info
            if lead.contact_name or lead.email or lead.phone:
                contact = ClientContact(
                    client_id=client.id,
                    org_id=current_user.org_id,
                    name=lead.contact_name or lead.name,
                    email=lead.email,
                    phone=lead.phone,
                    role_title=None,
                )
                db.add(contact)

            # Update lead
            lead.status = LeadStatus.CONVERTED
            lead.converted_client_id = client.id
            db.add(lead)
        else:
            # Lead already converted, use existing client
            client_id = lead.converted_client_id

    if not client_id:
        raise HTTPException(
            status_code=400, detail="Quote must be linked to a client or lead"
        )

    # Create job
    job = Job(
        org_id=current_user.org_id,
        name=quote.name,
        address=quote.name,  # Use quote name as address
        status=JobStatus.PLANNED,
        client_id=client_id,
        created_by_user_id=current_user.id,
    )
    db.add(job)
    db.flush()
    assert job.id is not None

    # Create projects from quote lines
    for line in quote.lines:
        project_type = line.project_type
        project = Project(
            org_id=current_user.org_id,
            name=project_type.name,
            description=project_type.description or "",
            rate=line.estimated_fee or project_type.rate or 0.0,
            forecasted_fee_amount=line.estimated_fee,
            fee_type=project_type.default_fee_type or FeeType.FIXED,
            status=ProjectStatus.PLANNED,
            contingency_percentage=project_type.default_contingency_percentage or 0.0,
            job_id=job.id,
            project_type_id=project_type.id,  # pyright: ignore[reportArgumentType]
            created_by_user_id=current_user.id,
        )
        db.add(project)

    # Update quote
    quote.status = QuoteStatus.ACCEPTED
    quote.converted_job_id = job.id
    db.add(quote)

    db.commit()

    return ConvertQuoteResponse(job_id=job.id, client_id=converted_client_id)
