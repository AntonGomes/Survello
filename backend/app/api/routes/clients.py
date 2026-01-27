from typing import cast
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from sqlalchemy.orm import joinedload

from app.api.deps import DBDep, CurrentUserDep
from app.models.client_model import (
    Client,
    ClientContact,
    ClientContactCreate,
    ClientContactRead,
    ClientCreate,
    ClientRead,
    ClientUpdate,
)
from app.models.job_read_minimal import JobReadMinimal


class ClientReadDetail(ClientRead):
    jobs: list[JobReadMinimal]


router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ClientRead,
    operation_id="createClient",
)
def create_client(
    client_in: ClientCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientRead:
    """
    Create a new client.
    """
    client = Client(
        org_id=current_user.org_id, name=client_in.name, address=client_in.address
    )
    db.add(client)
    db.flush()
    assert client.id is not None

    for contact_in in client_in.contacts:
        contact = ClientContact(
            client_id=client.id,
            org_id=current_user.org_id,
            name=contact_in.name,
            email=contact_in.email,
            phone=contact_in.phone,
            role_title=contact_in.role_title,
        )
        db.add(contact)

    db.commit()
    db.refresh(client)
    return cast(ClientRead, client)


@router.get("/", response_model=list[ClientRead], operation_id="readClients")
def read_clients(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = 100,
) -> list[ClientRead]:
    """
    Retrieve clients.
    """
    clients = (
        db.exec(
            select(Client)
            .where(Client.org_id == current_user.org_id)
            .options(joinedload(Client.contacts))  # ty: ignore[arg-type]
            .offset(offset)
            .limit(limit)
        )
        .unique()
        .all()
    )
    return clients


@router.get("/{client_id}", response_model=ClientReadDetail, operation_id="readClient")
def read_client(
    client_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientReadDetail:
    client = (
        db.exec(
            select(Client)
            .where(Client.id == client_id)
            .options(
                joinedload(Client.contacts),  # ty: ignore[arg-type]
                joinedload(Client.jobs),
            )
        )
        .unique()
        .first()
    )

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return cast(ClientReadDetail, client)


@router.patch("/{client_id}", response_model=ClientRead, operation_id="updateClient")
def update_client(
    client_id: int,
    client_in: ClientUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientRead:
    client = db.exec(
        select(Client)
        .where(Client.id == client_id)
        .options(joinedload(Client.contacts))  # ty: ignore[arg-type]
    ).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = client_in.model_dump(exclude_unset=True)
    client.sqlmodel_update(update_data)

    db.add(client)
    db.commit()
    db.refresh(client)
    return cast(ClientRead, client)


@router.delete(
    "/{client_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    operation_id="deleteClient",
)
def delete_client(
    client_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> None:
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(client)
    db.commit()
    return


@router.post(
    "/{client_id}/contacts",
    status_code=status.HTTP_201_CREATED,
    response_model=ClientContactRead,
    operation_id="createClientContact",
)
def create_client_contact(
    client_id: int,
    contact_in: ClientContactCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientContactRead:
    """
    Create a new contact for a client.
    """
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    contact = ClientContact.model_validate(
        contact_in, update={"client_id": client_id, "org_id": current_user.org_id}
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return cast(ClientContactRead, contact)


@router.patch(
    "/{client_id}/key-contact/{contact_id}",
    response_model=ClientRead,
    operation_id="setKeyContact",
)
def set_key_contact(
    client_id: int,
    contact_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientRead:
    """
    Set the key contact for a client.
    """
    client = db.exec(
        select(Client)
        .where(Client.id == client_id)
        .options(joinedload(Client.contacts))  # ty: ignore[arg-type]
    ).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify the contact belongs to this client
    contact = db.get(ClientContact, contact_id)
    if not contact or contact.client_id != client_id:
        raise HTTPException(status_code=404, detail="Contact not found for this client")

    client.key_contact_id = contact_id
    db.add(client)
    db.commit()
    db.refresh(client)
    return cast(ClientRead, client)


@router.delete(
    "/{client_id}/contacts/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    operation_id="deleteClientContact",
)
def delete_client_contact(
    client_id: int,
    contact_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> None:
    """
    Delete a contact from a client.
    """
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    contact = db.get(ClientContact, contact_id)
    if not contact or contact.client_id != client_id:
        raise HTTPException(status_code=404, detail="Contact not found for this client")

    # If this was the key contact, clear it
    if client.key_contact_id == contact_id:
        client.key_contact_id = None
        db.add(client)

    db.delete(contact)
    db.commit()
    return
