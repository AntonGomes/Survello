from http import HTTPStatus

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.client_model import Client
from app.models.instruction_model import (
    Instruction,
    InstructionStatus,
    InstructionType,
)
from app.models.job_model import Job, JobStatus
from app.models.time_entry_model import TimeEntry


def _create_instruction_for_time_test(
    session: Session, setup_data: dict, prefix: str
) -> Instruction:
    """Create client, job, type, and instruction for time tests."""
    cli = Client(name=f"{prefix} Client", org_id=setup_data["org_id"])
    session.add(cli)
    session.commit()
    session.refresh(cli)

    job = Job(
        name=f"{prefix} Job",
        status=JobStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
        client_id=cli.id,
    )
    session.add(job)

    pt = InstructionType(
        name=f"{prefix} Type",
        org_id=setup_data["org_id"],
        description=f"For {prefix.lower()} tests",
    )
    session.add(pt)
    session.commit()
    session.refresh(job)
    session.refresh(pt)

    instruction = Instruction(
        job_id=job.id,
        instruction_type_id=pt.id,
        status=InstructionStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
    )
    session.add(instruction)
    session.commit()
    session.refresh(instruction)
    return instruction


def test_time_entries_start_stop_workflow(
    client: TestClient, session: Session, setup_data: dict
):
    """Test the complete timer workflow: start -> get current -> stop."""
    project = _create_instruction_for_time_test(
        session, setup_data, "Time Test"
    )
    client.cookies = {"session_token": setup_data["token"]}

    # 1. Get current timer - should be None initially
    response = client.get("/time/current")
    assert response.status_code == HTTPStatus.OK
    assert response.json() is None, "Expected no active timer initially"

    # 2. Start timer with payload matching frontend format
    start_payload = {
        "instruction_id": project.id,
        "description": "Working on initial implementation",
    }
    response = client.post("/time/start", json=start_payload)
    assert response.status_code == HTTPStatus.OK, (
        f"Failed to start timer: {response.text}"
    )
    start_data = response.json()

    # Verify response structure matches TimeEntryOut
    assert start_data["id"] is not None
    assert start_data["instruction_id"] == project.id
    # instruction_name now comes from instruction type
    assert start_data["instruction_name"] == "Time Test Type"
    assert start_data["user_id"] == setup_data["user_id"]
    assert start_data["end_time"] is None, "Timer should not be stopped yet"
    assert start_data["description"] == "Working on initial implementation"

    # 3. Try to start another timer - should fail
    response = client.post("/time/start", json=start_payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST, (
        "Should not allow starting second timer"
    )
    assert "already running" in response.json()["detail"].lower()

    # 4. Get current timer - should return the active one
    response = client.get("/time/current")
    assert response.status_code == HTTPStatus.OK
    current_data = response.json()
    assert current_data is not None, "Expected active timer"
    assert current_data["id"] == start_data["id"]
    assert current_data["end_time"] is None

    # 5. Stop the timer
    response = client.post("/time/stop")
    assert response.status_code == HTTPStatus.OK, (
        f"Failed to stop timer: {response.text}"
    )
    stop_data = response.json()

    assert stop_data["id"] == start_data["id"]
    assert stop_data["end_time"] is not None, "Timer should be stopped"
    assert stop_data["duration_minutes"] is not None
    assert stop_data["duration_minutes"] >= 0

    # 6. Get current timer - should be None again
    response = client.get("/time/current")
    assert response.status_code == HTTPStatus.OK
    assert response.json() is None, "Expected no active timer after stop"

    # 7. Try to stop when no timer is running - should fail
    response = client.post("/time/stop")
    assert response.status_code == HTTPStatus.NOT_FOUND, (
        "Should fail when no timer to stop"
    )
    assert "no active timer" in response.json()["detail"].lower()


def test_time_entries_manual_logging(
    client: TestClient, session: Session, setup_data: dict
):
    """Test manual time logging without using the timer."""
    project = _create_instruction_for_time_test(
        session, setup_data, "Manual Time"
    )
    client.cookies = {"session_token": setup_data["token"]}

    logged_minutes = 90
    manual_payload = {
        "instruction_id": project.id,
        "duration_minutes": logged_minutes,
        "description": "Research and documentation",
    }
    response = client.post("/time/manual", json=manual_payload)
    assert response.status_code == HTTPStatus.OK, (
        f"Failed to log manual time: {response.text}"
    )
    manual_data = response.json()

    assert manual_data["duration_minutes"] == logged_minutes
    assert manual_data["description"] == "Research and documentation"
    # instruction_name now comes from instruction type
    assert manual_data["instruction_name"] == "Manual Time Type"
    # Manual entries have start_time == end_time
    assert manual_data["end_time"] is not None


def test_time_entries_project_not_found(
    client: TestClient, session: Session, setup_data: dict
):
    """Test starting timer with non-existent instruction fails."""
    client.cookies = {"session_token": setup_data["token"]}

    # Try to start timer with non-existent instruction
    response = client.post("/time/start", json={"instruction_id": 99999})
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "instruction not found" in response.json()["detail"].lower()


def test_time_entries_project_entries_list(
    client: TestClient, session: Session, setup_data: dict
):
    """Test getting time entries for a specific project."""
    project = _create_instruction_for_time_test(
        session, setup_data, "List Time"
    )

    # Create some time entries directly
    entry1 = TimeEntry(
        instruction_id=project.id,
        user_id=setup_data["user_id"],
        description="First entry",
        duration_minutes=30,
    )
    entry2 = TimeEntry(
        instruction_id=project.id,
        user_id=setup_data["user_id"],
        description="Second entry",
        duration_minutes=45,
    )
    session.add(entry1)
    session.add(entry2)
    session.commit()

    # Set auth cookie
    client.cookies = {"session_token": setup_data["token"]}

    # Get instruction time entries
    response = client.get(f"/time/instruction/{project.id}")
    assert response.status_code == HTTPStatus.OK, (
        f"Failed to get entries: {response.text}"
    )
    entries = response.json()

    expected_entry_count = 2
    assert len(entries) >= expected_entry_count
    descriptions = [e["description"] for e in entries]
    assert "First entry" in descriptions
    assert "Second entry" in descriptions
