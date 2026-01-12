from sqlalchemy import create_engine, text
from app.core.settings import Settings

settings = Settings()
engine = create_engine(settings.db_url)

with engine.connect() as connection:
    # Check if alembic_version exists
    try:
        connection.execute(text("DROP TABLE alembic_version"))
        print("Dropped alembic_version table.")
        connection.commit()
    except Exception as e:
        print(f"Error dropping alembic_version (it might not exist): {e}")

    # List other tables
    try:
        result = connection.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        )
        tables = [row[0] for row in result]
        if tables:
            print(f"EXISTING_TABLES: {', '.join(tables)}")
        else:
            print("NO_EXISTING_TABLES")
    except Exception as e:
        print(f"Error listing tables: {e}")
