from http import HTTPStatus

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.client_model import Client


def test_clients_workflow(client: TestClient, session: Session, setup_data: dict):
    # Authenticate
    client.cookies = {"session_token": setup_data["token"]}

    # Create Client with Contacts
    client_payload = {
        "name": "Acme Corp",
        "address": "Rocket Road",
        "contacts": [
            {
                "name": "Wile E. Coyote",
                "email": "wile@acme.com",
                "role_title": "Super Genius",
            }
        ],
    }

    response = client.post("/clients/", json=client_payload)
    assert response.status_code == HTTPStatus.CREATED, response.text
    client_data = response.json()
    assert client_data["name"] == "Acme Corp"

    # Verify DB
    db_client = session.get(Client, client_data["id"])
    assert db_client is not None
    assert db_client.org_id == setup_data["org_id"]

    # Verify Contact
    assert len(db_client.contacts) == 1
    contact = db_client.contacts[0]
    assert contact.name == "Wile E. Coyote"
    assert contact.email == "wile@acme.com"
    assert contact.org_id == setup_data["org_id"]
