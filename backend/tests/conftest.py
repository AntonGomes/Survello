import sys
from unittest.mock import MagicMock
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Mock python-magic which requires a system library not present in this env
sys.modules["magic"] = MagicMock()

from app.main import app  # noqa: E402
from app.api.deps import get_db, get_storage_service, get_llm_service  # noqa: E402
from app.models.user_model import User, Org, Session as UserSession, UserRole  # noqa: E402
from app.models.file_model import File, FileRole  # noqa: E402
from app.services.storage import StorageService  # noqa: E402
from app.services.llm import BaseLLMService, OpenAIService, LLMContainer  # noqa: E402


def pytest_addoption(parser):
    parser.addoption(
        "--save-output",
        action="store_true",
        default=False,
        help="Save generated files to tests/output for inspection",
    )
    parser.addoption(
        "--file-type",
        action="store",
        default="docx",
        help="Specify the file type for document generation tests (docx or xlsx)",
    )


# -----------------------------------------------------------------------------
# SHARED FIXTURES
# -----------------------------------------------------------------------------

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False}, 
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="mock_storage")
def mock_storage_fixture():
    mock = MagicMock(spec=StorageService)
    mock.get_file_data.return_value = b"fake docx content" 
    mock.generate_presigned_url.return_value = "http://mock-s3/file.pdf"
    return mock

@pytest.fixture(name="mock_llm")
def mock_llm_fixture():
    mock = MagicMock(spec=OpenAIService)
    mock.upload_template.return_value = LLMContainer("file_id", "container_id", "container_file_id")
    mock.generate.return_value = iter(["Generated content"])
    mock.download.return_value = b"fake artefact content"
    return mock

@pytest.fixture(name="client")
def client_fixture(session: Session, mock_storage: StorageService, mock_llm: BaseLLMService):
    def get_session_override():
        return session
    
    def get_storage_override():
        return mock_storage
        
    def get_llm_override():
        return mock_llm

    app.dependency_overrides[get_db] = get_session_override
    app.dependency_overrides[get_storage_service] = get_storage_override
    app.dependency_overrides[get_llm_service] = get_llm_override
    
    yield TestClient(app)
    
    app.dependency_overrides.clear()

@pytest.fixture(name="setup_data")
def setup_data_fixture(session: Session):
    # Create Org
    org = Org(name="Test Org")
    session.add(org)
    session.commit()
    
    # Create User
    user = User(
        name="Test User", 
        email="test@example.com", 
        password_hash="dummyhash",
        org_id=org.id,
        role=UserRole.ADMIN
    )
    session.add(user)
    session.commit()
    
    # Create Session/Token
    token = "test-token"
    user_session = UserSession(
        session_token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        user_id=user.id
    )
    session.add(user_session)
    
    # Create Template File (Generic)
    template = File(
        file_name="example_template.docx",
        storage_key="test/template.docx",
        mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        role=FileRole.TEMPLATE,
        size_bytes=1000,
        org_id=org.id,
        uploaded_by_user_id=user.id
    )
    session.add(template)
    
    # Create Context File (Generic)
    context = File(
        file_name="site_notes.docx",
        storage_key="test/site_notes.docx",
        mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        role=FileRole.INPUT,
        size_bytes=500,
        org_id=org.id,
        uploaded_by_user_id=user.id
    )
    session.add(context)
    
    session.commit()
    session.refresh(template)
    session.refresh(context)
    
    return {
        "token": token,
        "template_id": template.id,
        "context_id": context.id,
        "user_id": user.id,
        "org_id": org.id,
        "email": user.email
    }
