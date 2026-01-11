import sys
from sqlalchemy import text
from app.core.db import engine

def main():
    print("🗑️  Dropping all tables...")
    
    # 1. Drop all application tables defined in SQLModel
    # Use cascade to handle circular dependencies if backend supports it (Postgres does)
    # But drop_all doesn't natively support cascade for all dialects in a simple way.
    # The error suggests using DROP CONSTRAINT which is tricky with drop_all.
    # A cleaner approach for standard Postgres is to disable checks or just drop schema public.
    
    # Alternative: Reflect and drop with ForeignKeyContraints handling or raw SQL.
    # Simpler raw SQL approach for Postgres:
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()
    
    print("✅ Tables dropped.")
    
    print("🔄 Running Alembic migrations to recreate schema...")
    import subprocess
    
    # Run alembic upgrade head using uv
    try:
        subprocess.run(
            ["uv", "run", "alembic", "upgrade", "head"], 
            check=True
        )
        print("✨ Database reset successfully.")
    except subprocess.CalledProcessError:
        print("❌ Migration failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
