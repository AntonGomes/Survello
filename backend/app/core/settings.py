from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        arbitrary_types_allowed=True, env_file=".env", extra="ignore"
    )

    # OpenAI / App
    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")
    container_prefix: str = Field(default="docgen")

    # AWS and S3
    aws_default_region: str | None = Field(default=None, alias="AWS_DEFAULT_REGION")
    s3_bucket_name: str | None = Field(default=None, alias="S3_BUCKET_NAME")
    s3_endpoint_url: str | None = Field(default=None, alias="S3_ENDPOINT_URL")
    aws_access_key: str | None = Field(default=None, alias="AWS_ACCESS_KEY")
    aws_secret_key: str | None = Field(default=None, alias="AWS_SECRET_KEY")

    # Database
    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    db_user: str = Field(default="postgres", alias="DB_USER")
    db_password: str = Field(default="mysecretpassword", alias="DB_PASSWORD")
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: str = Field(default="5432", alias="DB_PORT")
    db_name: str = Field(default="postgres", alias="DB_NAME")
    db_echo: bool = Field(
        default=False, alias="DB_ECHO", description="SQLAlchemy echo for debugging"
    )

    # Feature Flags / Mocks
    use_mock_llm: bool = Field(default=False, alias="USE_MOCK_LLM")
    use_mock_storage: bool = Field(default=False, alias="USE_MOCK_STORAGE")

    @property
    def db_url(self) -> str:
        if self.database_url:
            return self.database_url
        # Construct the full SQLAlchemy URL
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


@lru_cache()
def get_settings() -> Settings:
    # BaseSettings automatically reads from .env and os.environ
    return Settings()  # pyright: ignore[reportCallIssue]
