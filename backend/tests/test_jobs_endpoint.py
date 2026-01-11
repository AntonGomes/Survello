from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.job_model import Job
from app.models.client_model import Client


def test_jobs_workflow(client: TestClient, session: Session, setup_data: dict):
    # Setup - Create Client
    cli = Client(name="Test Client", org_id=setup_data["org_id"])
    session.add(cli)
    session.commit()
    session.refresh(cli)

    # Authenticate
    client.cookies = {"session_token": setup_data["token"]}

    # Create Job
    job_payload = {
        "name": "New Job",
        "status": "planned",
        "client_id": cli.id,
        "address": "123 Test St",
    }

    response = client.post("/jobs/", json=job_payload)
    assert response.status_code == 201, response.text
    job_data = response.json()
    assert job_data["name"] == "New Job"
    assert job_data["client_id"] == cli.id

    # Verify DB
    db_job = session.get(Job, job_data["id"])
    assert db_job is not None
    assert db_job.org_id == setup_data["org_id"]
    assert db_job.created_by_user_id == setup_data["user_id"]
