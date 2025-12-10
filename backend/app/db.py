# app/db.py
import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Load environment variables from .env if present
load_dotenv()

# Prefer a full DATABASE_URL, otherwise build one from component env vars
_db_url = os.getenv("DATABASE_URL")
if not _db_url:
    db_user = os.getenv("DB_USER", "postgres")
    db_password = quote_plus(os.getenv("DB_PASSWORD", "mysecretpassword"))
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "postgres")
    _db_url = (
        f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    )

DATABASE_URL = _db_url

# The engine manages the actual DB connection pool
engine = create_engine(
    DATABASE_URL,
    echo=True,          # logs SQL to stdout; great for dev, turn off in prod
    future=True,
)

# Session factory – you call SessionLocal() to get a session
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)

# Base class for all your ORM models
class Base(DeclarativeBase):
    pass
