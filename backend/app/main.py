from __future__ import annotations

from fastapi import FastAPI
from sqlalchemy import text, Engine
from sqlalchemy.exc import OperationalError
from fastapi.middleware.cors import CORSMiddleware 

from app.api.users import router as users_router
from app.api.generate import (
    router as generate_router,
)  # Assuming generate.py was renamed routes.py
from app.core.logging import logger
from app.core.deps import get_database


def check_db_connection(engine: Engine) -> None:
    """Attempt to connect to the database and execute a simple query."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection established successfully.")
    except OperationalError as e:
        logger.error("Database connection failed: %s", e)
        # Re-raise the exception to prevent the application from starting
        raise
    except Exception as e:
        logger.exception("An unexpected error occurred during database check.")
        raise


def create_app() -> FastAPI:
    """Initializes the FastAPI application and includes routers."""
    app = FastAPI(
        title="Document Generation Service",
        version="0.1.0",
        description="Core services for template processing and LLM interaction.",
    )

    # 1. Include Routers
    app.include_router(users_router, tags=["Users"])
    app.include_router(generate_router, tags=["Generation"])

    origins = [
        "http://localhost:3000",           # For local development
        "https://docgen.vercel.app",       # Your Vercel production domain
        "https://docgen-git-main.vercel.app" # Your Vercel preview URLs (optional)
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins, # STRICT: Only allow these domains
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Get the global database engine instance
    db_engine = get_database().get_engine()

    # 3. Define Startup Hook
    @app.on_event("startup")
    def startup_event():
        """Executed when the application starts up."""
        logger.info("Application starting up...")
        check_db_connection(db_engine)
        logger.info("Application startup complete.")

    return app


# Application entry point
app = create_app()
