from http import HTTPStatus

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user_model import User


def test_users_workflow(client: TestClient, session: Session, setup_data: dict):
    # 1. Register new user (via auth endpoint)
    new_user_payload = {
        "name": "New Guy",
        "email": "newguy@example.com",
        "password": "securepassword123",
        "org_name": "New Org",
    }
    response = client.post("/auth/register", json=new_user_payload)
    assert response.status_code == HTTPStatus.OK
    user_data = response.json()
    assert user_data["email"] == new_user_payload["email"]
    assert "password" not in user_data  # Should return UserRead

    # 2. Get Me (using existing user from setup_data)
    client.cookies = {"session_token": setup_data["token"]}
    response = client.get("/users/me")
    assert response.status_code == HTTPStatus.OK
    me_data = response.json()
    assert me_data["id"] == setup_data["user_id"]
    assert me_data["email"] == setup_data["email"]

    # 3. Update Me
    update_payload = {"name": "Updated Name"}
    response = client.patch("/users/me", json=update_payload)
    assert response.status_code == HTTPStatus.OK
    updated_data = response.json()
    assert updated_data["name"] == "Updated Name"

    # Verify DB
    db_user = session.get(User, setup_data["user_id"])
    assert db_user is not None
    assert db_user.name == "Updated Name"
