from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict, Field


def _default_storage_root() -> Path:
    env_storage_root = os.environ.get("STORAGE_ROOT")
    return Path(env_storage_root)


class Settings(BaseModel):
    """Application configuration loaded from environment variables."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")
    container_prefix: str = Field(default="docgen")

    template_temp_dir: Path = Field(default=Path("/tmp/templates"))
    context_temp_dir: Path = Field(default=Path("/tmp/context"))
    output_temp_dir: Path = Field(default=Path("/tmp/output"))

    storage_backend: str = Field(default="local", description="local|s3")
    storage_base_url: str = Field(default="http://localhost:8000")
    storage_root: Path = Field(default_factory=_default_storage_root)

    s3_bucket_name: str | None = Field(default=None)
    s3_endpoint_url: str | None = Field(default=None)
    s3_access_key: str | None = Field(default=None)
    s3_secret_key: str | None = Field(default=None)



@lru_cache()
def get_settings() -> Settings:
    load_dotenv()
    settings = Settings(
        OPENAI_API_KEY=os.environ["OPENAI_API_KEY"],  # using alias
        storage_backend=os.environ.get("STORAGE_BACKEND", "local"),
        storage_base_url=os.environ.get("STORAGE_BASE_URL", "http://localhost:8000"),
        s3_bucket_name=os.environ.get("S3_BUCKET_NAME"),
        s3_endpoint_url=os.environ.get("S3_ENDPOINT_URL"),
        s3_access_key=os.environ.get("S3_ACCESS_KEY"),
        s3_secret_key=os.environ.get("S3_SECRET_KEY"),
    )
    settings.storage_root.mkdir(parents=True, exist_ok=True)
    return settings
