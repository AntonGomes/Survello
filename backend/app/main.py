from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.runs import router as runs_router
from app.api.routes.files import router as files_router
from app.api.routes.auth import router as auth_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.projects import router as projects_router
from app.api.routes.users import router as users_router
from app.api.routes.clients import router as clients_router
from app.api.routes.time import router as time_router
from app.api.routes.leads import router as leads_router
from app.api.routes.quotes import router as quotes_router
from app.api.routes.surveys import router as surveys_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.invitations import router as invitations_router
from app.api.routes.org import router as org_router

from contextlib import asynccontextmanager
from app.core.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Document Generation Service",
    version="0.1.0",
    description="Core services for template processing and LLM interaction.",
    lifespan=lifespan,
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(runs_router, prefix="/runs", tags=["Runs"])
app.include_router(files_router, prefix="/store", tags=["Storage"])
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
app.include_router(projects_router, prefix="/projects", tags=["Projects"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(clients_router, prefix="/clients", tags=["Clients"])
app.include_router(time_router, prefix="/time", tags=["Time Tracking"])
app.include_router(leads_router, prefix="/leads", tags=["Leads"])
app.include_router(quotes_router, prefix="/quotes", tags=["Quotes"])
app.include_router(surveys_router, prefix="/surveys", tags=["Surveys"])
app.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
app.include_router(invitations_router, prefix="/invitations", tags=["Invitations"])
app.include_router(org_router, prefix="/org", tags=["Organization"])

origins = [
    "http://localhost:3000",  # For local development
    "http://localhost:3001",  # For local development
    "https://survelloapp.com",  # Production domain
    "https://www.survelloapp.com",  # Production domain with www
    "https://survello.vercel.app",  # Vercel deployment
    "https://survello-git-main.vercel.app",  # Vercel preview URLs
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # STRICT: Only allow these domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
