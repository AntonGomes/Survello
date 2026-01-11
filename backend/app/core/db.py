from sqlmodel import create_engine, SQLModel, Session
from app.core.settings import get_settings

settings = get_settings()

# Create the engine once
engine = create_engine(settings.db_url, echo=False, pool_pre_ping=True)


def init_db():
    """
    Create all tables defined in SQLModel metadata.
    This should be called on application startup.
    """
    # Import models here to ensure they are registered with SQLModel.metadata
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency to get a standard SQLModel session.
    """
    with Session(engine) as session:
        yield session
