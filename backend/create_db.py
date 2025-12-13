# create_db.py
from app.core.db import Base
from app.core.deps import get_database
from app.models import orm  # noqa: F401  (register models)


def main() -> None:
    engine = get_database.get_engine()
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")


if __name__ == "__main__":
    main()
