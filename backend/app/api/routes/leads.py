from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from pydantic import BaseModel

from app.api.deps import DBDep, CurrentUserDep
from app.models.lead_model import (
    Lead,
    LeadCreate,
    LeadRead,
    LeadUpdate,
    LeadStatus,
)
from app.models.client_model import Client, ClientContact


router = APIRouter()


class LeadUpdateEntry(BaseModel):
    text: str


class ConvertLeadResponse(BaseModel):
    client_id: int
    contact_id: int | None = None


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=LeadRead,
    operation_id="createLead",
)
def create_lead(
    lead_in: LeadCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> LeadRead:
    """Create a new lead."""
    lead = Lead(
        org_id=current_user.org_id,
        name=lead_in.name,
        contact_name=lead_in.contact_name,
        email=lead_in.email,
        phone=lead_in.phone,
        status=lead_in.status,
        notes=lead_in.notes,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead  # pyright: ignore[reportReturnType]


@router.get("/", response_model=list[LeadRead], operation_id="readLeads")
def read_leads(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = 100,
    status: LeadStatus | None = None,
) -> list[LeadRead]:
    """Retrieve leads, optionally filtered by status."""
    query = select(Lead).where(Lead.org_id == current_user.org_id)

    if status:
        query = query.where(Lead.status == status)

    leads = db.exec(query.offset(offset).limit(limit)).all()
    return leads  # pyright: ignore[reportReturnType]


@router.get("/{lead_id}", response_model=LeadRead, operation_id="readLead")
def read_lead(
    lead_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> LeadRead:
    """Get a specific lead by ID."""
    lead = db.get(Lead, lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return lead  # pyright: ignore[reportReturnType]


@router.patch("/{lead_id}", response_model=LeadRead, operation_id="updateLead")
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> LeadRead:
    """Update a lead."""
    lead = db.get(Lead, lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = lead_in.model_dump(exclude_unset=True)
    lead.sqlmodel_update(update_data)

    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead  # pyright: ignore[reportReturnType]


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    operation_id="deleteLead",
)
def delete_lead(
    lead_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> None:
    """Delete a lead."""
    lead = db.get(Lead, lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(lead)
    db.commit()


@router.post(
    "/{lead_id}/updates",
    response_model=LeadRead,
    operation_id="addLeadUpdate",
)
def add_lead_update(
    lead_id: int,
    update_entry: LeadUpdateEntry,
    current_user: CurrentUserDep,
    db: DBDep,
) -> LeadRead:
    """Add an update entry to a lead's timeline."""
    lead = db.get(Lead, lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_update: dict[str, Any] = {
        "text": update_entry.text,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if lead.updates is None:
        lead.updates = []
    lead.updates = [new_update] + lead.updates  # Prepend new update

    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead  # pyright: ignore[reportReturnType]


@router.post(
    "/{lead_id}/convert",
    response_model=ConvertLeadResponse,
    operation_id="convertLead",
)
def convert_lead(
    lead_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ConvertLeadResponse:
    """
    Convert a lead to a client. Creates a Client and optionally a Contact
    from the lead's data. Updates lead status to CONVERTED.
    """
    lead = db.get(Lead, lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if lead.status == LeadStatus.CONVERTED:
        raise HTTPException(status_code=400, detail="Lead already converted")

    # Create client from lead
    client = Client(
        org_id=current_user.org_id,
        name=lead.name,
        address=None,  # Lead doesn't have address
    )
    db.add(client)
    db.flush()
    assert client.id is not None

    contact_id: int | None = None

    # Create contact if we have contact info
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
        db.flush()
        contact_id = contact.id

    # Update lead status and link to client
    lead.status = LeadStatus.CONVERTED
    lead.converted_client_id = client.id
    db.add(lead)

    db.commit()

    return ConvertLeadResponse(client_id=client.id, contact_id=contact_id)
