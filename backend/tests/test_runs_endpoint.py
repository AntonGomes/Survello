from http import HTTPStatus
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.run_model import Run


def test_create_run_endpoint(
    client: TestClient,
    session: Session,
    setup_data: dict,
    mock_storage: MagicMock,
    mock_llm: MagicMock,
):
    # Arrange
    payload = {
        "template_file_id": setup_data["template_id"],
        "context_file_ids": [setup_data["context_id"]],
    }

    # Act
    # Pass the session token in cookies
    client.cookies = {"session_token": setup_data["token"]}

    # Patch conversions to avoid system dependencies and binary fixture issues.
    # In CI, DOCX fixtures may be Git LFS pointers (not real ZIP/DOCX), so we mock
    # `to_summary` rather than relying on parsing real DOCX bytes.
    with (
        patch("app.orchestrators.generation.to_pdf", return_value=b"fake pdf content"),
        patch("app.orchestrators.generation.to_summary", return_value="fake summary"),
    ):
        response = client.post("/runs/", json=payload)

    # Assert
    assert response.status_code == HTTPStatus.OK, f"Response: {response.text}"
    data = response.json()
    assert data["template_file_id"] == setup_data["template_id"]
    assert data["org_id"] == setup_data["org_id"]

    # Verify DB state
    run_id = data["id"]
    db_run = session.get(Run, run_id)
    assert db_run is not None
    assert db_run.created_by_user_id == setup_data["user_id"]

    # Verify background task execution
    session.refresh(db_run)
    assert db_run.status in [
        "completed",
        "error",
        "uploading",
        "generating",
        "finalising",
    ]

    mock_storage.get_file_data.assert_called()
    mock_llm.upload_template.assert_called()
    mock_llm.generate.assert_called()
