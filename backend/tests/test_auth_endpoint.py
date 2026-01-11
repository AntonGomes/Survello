from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user_model import User
from app.core.security import hash_password

def test_auth_workflow(client: TestClient, session: Session, setup_data: dict):
    # 1. Create User with known password (overwriting setup_data user or creating new)
    # setup_data user has "dummyhash". We need a real hash for verify_password to work?
    # Or we test logic.
    
    # Let's create a fresh user for login test
    password = "MySecretPassword123!"
    user = User(
        name="Login User",
        email="login@example.com",
        password_hash=hash_password(password),
        org_id=setup_data["org_id"]
    )
    session.add(user)
    session.commit()
    
    # 2. Login
    login_payload = {
        "email": "login@example.com",
        "password": password
    }
    
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    
    # Check Cookie
    assert "session_token" in response.cookies
    token = response.cookies["session_token"]
    assert len(token) > 10
    
    # 3. Use token to get me (verify it works)
    client.cookies = {"session_token": token}
    response = client.get("/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "login@example.com"
