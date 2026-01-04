from sqlalchemy import create_engine, text
from app.core.settings import get_settings

settings = get_settings()
engine = create_engine(settings.db_url)

with engine.connect() as conn:
    try:
        # Query to get enum values for 'run_status'
        result = conn.execute(text("SELECT unnest(enum_range(NULL::run_status))"))
        values = [row[0] for row in result.fetchall()]
        print(f"Current 'run_status' enum values in DB: {values}")
    except Exception as e:
        print(f"Error: {e}")
