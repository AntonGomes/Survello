from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session


class Database:
    """Encapsulates engine + session factory."""

    def __init__(self, db_url: str, db_echo: bool = False) -> None:
        self.engine = create_engine(
            db_url,
            echo=db_echo,
            future=True,
        )
        self._SessionLocal = sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            future=True,
        )

    def get_session(self) -> Session:
        """Create a new Session instance."""
        return self._SessionLocal()

    def get_engine(self):
        return self.engine
