# create_db.py
from app.db import engine, Base
from app.models import orm  # noqa: F401  (import so models are registered with Base)

def main() -> None:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    main()