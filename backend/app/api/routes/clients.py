from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from sqlalchemy.orm import joinedload

from app.api.deps import DBDep, CurrentUserDep
from app.models.client_model import (
    Client,
    ClientContact,
    ClientCreate,
    ClientRead,
    ClientUpdate,
)

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ClientRead)
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
    return client  # pyright: ignore[reportReturnType]


@router.get("/", response_model=list[ClientRead])
def read_clients(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = 100,
) -> list[ClientRead]:
    """
    Retrieve clients.
    """
    clients = db.exec(
        select(Client)
        .where(Client.org_id == current_user.org_id)
        .options(joinedload(Client.contacts))  # pyright: ignore[reportArgumentType]
        .offset(offset)
        .limit(limit)
    ).all()
    return clients  # pyright: ignore[reportReturnType]


@router.get("/{client_id}", response_model=ClientRead)
def read_client(
    client_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientRead:
    client = db.exec(
        select(Client)
        .where(Client.id == client_id)
        .options(joinedload(Client.contacts))  # pyright: ignore[reportArgumentType]
    ).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return client  # pyright: ignore[reportReturnType]


@router.patch("/{client_id}", response_model=ClientRead)
def update_client(
    client_id: int,
    client_in: ClientUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ClientRead:
    client = db.exec(
        select(Client)
        .where(Client.id == client_id)
        .options(joinedload(Client.contacts))  # pyright: ignore[reportArgumentType]
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
    return client  # pyright: ignore[reportReturnType]


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
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
