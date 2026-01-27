"""
Tests for the time entries API endpoints.

These tests verify the timer functionality works correctly with realistic
frontend payloads, including:
- Starting a timer
- Getting current timer status
- Stopping a timer
- Manual time logging
- Error cases (no active timer, timer already running, etc.)
"""

from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.instruction_model import InstructionType, FeeType, Instruction, InstructionStatus
from app.models.job_model import Job, JobStatus
from app.models.client_model import Client
from app.models.time_entry_model import TimeEntry


def test_time_entries_start_stop_workflow(
    client: TestClient, session: Session, setup_data: dict
):
    """Test the complete timer workflow: start -> get current -> stop."""
    # Setup: Create Client -> Job -> InstructionType -> Project
    cli = Client(name="Time Test Client", org_id=setup_data["org_id"])
    session.add(cli)
    session.commit()
    session.refresh(cli)

    job = Job(
        name="Time Test Job",
        status=JobStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
        client_id=cli.id,
    )
    session.add(job)

    pt = InstructionType(
        name="Time Test Type",
        org_id=setup_data["org_id"],
        description="For time tracking tests",
    )
    session.add(pt)
    session.commit()
    session.refresh(job)
    session.refresh(pt)

    project = Instruction(
        name="Time Test Instruction",
        job_id=job.id,
        instruction_type_id=pt.id,
        fee_type=FeeType.HOURLY,
        status=InstructionStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
    )
    session.add(project)
    session.commit()
    session.refresh(project)

    # Set auth cookie
    client.cookies = {"session_token": setup_data["token"]}

    # 1. Get current timer - should be None initially
    response = client.get("/time/current")
    assert response.status_code == 200
    assert response.json() is None, "Expected no active timer initially"

    # 2. Start timer with payload matching frontend format
    start_payload = {
        "instruction_id": project.id,
        "description": "Working on initial implementation",
    }
    response = client.post("/time/start", json=start_payload)
    assert response.status_code == 200, f"Failed to start timer: {response.text}"
    start_data = response.json()

    # Verify response structure matches TimeEntryOut
    assert start_data["id"] is not None
    assert start_data["instruction_id"] == project.id
    assert start_data["instruction_name"] == "Time Test Instruction"
    assert start_data["user_id"] == setup_data["user_id"]
    assert start_data["end_time"] is None, "Timer should not be stopped yet"
    assert start_data["description"] == "Working on initial implementation"

    # 3. Try to start another timer - should fail
    response = client.post("/time/start", json=start_payload)
    assert response.status_code == 400, "Should not allow starting second timer"
    assert "already running" in response.json()["detail"].lower()

    # 4. Get current timer - should return the active one
    response = client.get("/time/current")
    assert response.status_code == 200
    current_data = response.json()
    assert current_data is not None, "Expected active timer"
    assert current_data["id"] == start_data["id"]
    assert current_data["end_time"] is None

    # 5. Stop the timer
    response = client.post("/time/stop")
    assert response.status_code == 200, f"Failed to stop timer: {response.text}"
    stop_data = response.json()

    assert stop_data["id"] == start_data["id"]
    assert stop_data["end_time"] is not None, "Timer should be stopped"
    assert stop_data["duration_minutes"] is not None
    assert stop_data["duration_minutes"] >= 0

    # 6. Get current timer - should be None again
    response = client.get("/time/current")
    assert response.status_code == 200
    assert response.json() is None, "Expected no active timer after stop"

    # 7. Try to stop when no timer is running - should fail
    response = client.post("/time/stop")
    assert response.status_code == 404, "Should fail when no timer to stop"
    assert "no active timer" in response.json()["detail"].lower()


def test_time_entries_manual_logging(
    client: TestClient, session: Session, setup_data: dict
):
    """Test manual time logging without using the timer."""
    # Setup: Create dependencies
    cli = Client(name="Manual Time Client", org_id=setup_data["org_id"])
    session.add(cli)
    session.commit()
    session.refresh(cli)

    job = Job(
        name="Manual Time Job",
        status=JobStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
        client_id=cli.id,
    )
    session.add(job)

    pt = InstructionType(
        name="Manual Time Type",
        org_id=setup_data["org_id"],
        description="For manual time tests",
    )
    session.add(pt)
    session.commit()
    session.refresh(job)
    session.refresh(pt)

    project = Instruction(
        name="Manual Time Instruction",
        job_id=job.id,
        instruction_type_id=pt.id,
        fee_type=FeeType.FIXED,
        status=InstructionStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
    )
    session.add(project)
    session.commit()
    session.refresh(project)

    initial_actual_hours = project.actual_hours or 0

    # Set auth cookie
    client.cookies = {"session_token": setup_data["token"]}

    # Log 90 minutes of manual time
    manual_payload = {
        "instruction_id": project.id,
        "duration_minutes": 90,
        "description": "Research and documentation",
    }
    response = client.post("/time/manual", json=manual_payload)
    assert response.status_code == 200, f"Failed to log manual time: {response.text}"
    manual_data = response.json()

    assert manual_data["duration_minutes"] == 90
    assert manual_data["description"] == "Research and documentation"
    assert manual_data["instruction_name"] == "Manual Time Instruction"
    # Manual entries have start_time == end_time
    assert manual_data["end_time"] is not None

    # Verify project actual_hours was updated
    session.refresh(project)
    expected_hours = initial_actual_hours + (90 / 60.0)
    assert project.actual_hours == expected_hours, (
        f"Expected {expected_hours} hours, got {project.actual_hours}"
    )


def test_time_entries_project_not_found(
    client: TestClient, session: Session, setup_data: dict
):
    """Test starting timer with non-existent project fails."""
    client.cookies = {"session_token": setup_data["token"]}

    # Try to start timer with non-existent project
    response = client.post("/time/start", json={"instruction_id": 99999})
    assert response.status_code == 404
    assert "project not found" in response.json()["detail"].lower()


def test_time_entries_project_entries_list(
    client: TestClient, session: Session, setup_data: dict
):
    """Test getting time entries for a specific project."""
    # Setup: Create dependencies
    cli = Client(name="List Time Client", org_id=setup_data["org_id"])
    session.add(cli)
    session.commit()
    session.refresh(cli)

    job = Job(
        name="List Time Job",
        status=JobStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
        client_id=cli.id,
    )
    session.add(job)

    pt = InstructionType(
        name="List Time Type",
        org_id=setup_data["org_id"],
        description="For list tests",
    )
    session.add(pt)
    session.commit()
    session.refresh(job)
    session.refresh(pt)

    project = Instruction(
        name="List Time Project",
        job_id=job.id,
        instruction_type_id=pt.id,
        fee_type=FeeType.HOURLY,
        status=InstructionStatus.ACTIVE,
        org_id=setup_data["org_id"],
        created_by_user_id=setup_data["user_id"],
    )
    session.add(project)
    session.commit()
    session.refresh(project)

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

    # Get project time entries
    response = client.get(f"/time/project/{project.id}")
    assert response.status_code == 200, f"Failed to get entries: {response.text}"
    entries = response.json()

    assert len(entries) >= 2
    descriptions = [e["description"] for e in entries]
    assert "First entry" in descriptions
    assert "Second entry" in descriptions
