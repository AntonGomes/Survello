from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.file_model import File


def test_files_workflow(
    client: TestClient, session: Session, setup_data: dict, mock_storage
):
    # 1. Presign
    # Ensure mock storage returns a URL
    mock_storage.generate_presigned_url.return_value = "https://s3.example.com/upload"

    presign_payload = [
        {
            "client_id": "temp-123",
            "file_name": "test.docx",
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "size_bytes": 1024,
        }
    ]

    # Authenticate
    client.cookies = {"session_token": setup_data["token"]}

    response = client.post("/store/presign", json=presign_payload)
    assert response.status_code == 200
    presign_data = response.json()
    assert len(presign_data) == 1
    assert presign_data[0]["put_url"] == "https://s3.example.com/upload"

    # 2. Create File Metadata
    create_payload = {
        "file_name": "test.docx",
        "storage_key": presign_data[0]["storage_key"],
        "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "size_bytes": 1024,
        "role": "template",
        "org_id": setup_data["org_id"],
    }

    response = client.post("/store/single", json=create_payload)
    assert response.status_code == 201
    file_data = response.json()
    assert file_data["file_name"] == "test.docx"
    assert file_data["id"] is not None

    # Verify DB
    db_file = session.get(File, file_data["id"])
    assert db_file is not None
    assert db_file.uploaded_by_user_id == setup_data["user_id"]
    assert db_file.org_id == setup_data["org_id"]
