from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import text

from app.api.routes.runs import router as runs_router
from app.api.routes.files import router as files_router
from app.api.routes.auth import router as auth_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.instructions import router as instructions_router
from app.api.routes.users import router as users_router
from app.api.routes.clients import router as clients_router
from app.api.routes.time import router as time_router
from app.api.routes.leads import router as leads_router
from app.api.routes.quotes import router as quotes_router
from app.api.routes.surveys import router as surveys_router
from app.api.routes.invitations import router as invitations_router
from app.api.routes.org import router as org_router
from app.api.routes.waitlist import router as waitlist_router

from app.core.db import init_db, engine
from app.core.settings import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.exception("Failed to initialize database: %s", e)
        raise
    yield
    logger.info("Shutting down application...")


PRODUCTION_ORIGINS = [
    "https://survelloapp.com",
    "https://www.survelloapp.com",
    "https://survello.vercel.app",
    "https://survello-git-main.vercel.app",
]


def _build_allowed_origins() -> list[str]:
    settings = get_settings()
    origins = list(PRODUCTION_ORIGINS)
    frontend = settings.frontend_url.rstrip("/")
    if frontend not in origins:
        origins.append(frontend)
    return origins


origins = _build_allowed_origins()

app = FastAPI(
    title="Document Generation Service",
    version="0.1.0",
    description="Core services for template processing and LLM interaction.",
    lifespan=lifespan,
)

# Add CORS middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler to log all unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled exception on %s %s: %s", request.method, request.url.path, exc
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint that also tests database connectivity."""
    from sqlmodel import Session

    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.exception("Health check failed: %s", e)
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
            },
        )


# Include routers AFTER middleware
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(runs_router, prefix="/runs", tags=["Runs"])
app.include_router(files_router, prefix="/store", tags=["Storage"])
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
app.include_router(instructions_router, prefix="/instructions", tags=["Instructions"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(clients_router, prefix="/clients", tags=["Clients"])
app.include_router(time_router, prefix="/time", tags=["Time Tracking"])
app.include_router(leads_router, prefix="/leads", tags=["Leads"])
app.include_router(quotes_router, prefix="/quotes", tags=["Quotes"])
app.include_router(surveys_router, prefix="/surveys", tags=["Surveys"])
app.include_router(invitations_router, prefix="/invitations", tags=["Invitations"])
app.include_router(org_router, prefix="/org", tags=["Organization"])
app.include_router(waitlist_router, prefix="/waitlist", tags=["Waitlist"])
