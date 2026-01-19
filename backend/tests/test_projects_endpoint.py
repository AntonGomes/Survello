from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.project_model import ProjectType, FeeType
from app.models.job_model import Job, JobStatus
from app.models.client_model import Client


def test_projects_workflow(client: TestClient, session: Session, setup_data: dict):
    # Setup dependencies
    # 0. Create Client
    cli = Client(name="Test Client", org_id=setup_data["org_id"])
    session.add(cli)
    session.commit()
    session.refresh(cli)

    # 1. Create a Job (needed for Project)
    job = Job(
        name="Test Job",
        status=JobStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
        client_id=cli.id,
    )
    session.add(job)

    # 2. Create a ProjectType (needed for Project)
    pt = ProjectType(
        name="Test Type", org_id=setup_data["org_id"], description="Test desc"
    )
    session.add(pt)
    session.commit()
    session.refresh(job)
    session.refresh(pt)

    # 3. Create Project
    client.cookies = {"session_token": setup_data["token"]}

    project_payload = {
        "name": "Test Project",
        "description": "A description",
        "job_id": job.id,
        "project_type_id": pt.id,
        "fee_type": FeeType.HOURLY,
        "status": "planned",
    }

    response = client.post("/projects/", json=project_payload)
    assert response.status_code == 201, response.text
    project_data = response.json()
    assert project_data["name"] == "Test Project"

    # 4. List Projects
    response = client.get("/projects/")
    assert response.status_code == 200
    list_data = response.json()
    assert len(list_data) >= 1
    assert any(p["id"] == project_data["id"] for p in list_data)

    # 5. List Project Types
    response = client.get("/projects/types")
    assert response.status_code == 200
    types_data = response.json()
    assert len(types_data) >= 1
    assert types_data[0]["name"] == "Test Type"

    # 6. Read Project Detail
    response = client.get(f"/projects/{project_data['id']}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == project_data["id"]
    assert detail["project_type"]["id"] == pt.id
    assert detail["job"]["id"] == job.id
