from functools import lru_cache
from typing import Literal
from uuid import UUID

from pydantic import AnyHttpUrl, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://postgres:password@localhost:5432/pixtall"
    auth_mode: Literal["development", "supabase"] = "development"
    dev_user_id: UUID = UUID("00000000-0000-0000-0000-000000000001")
    supabase_jwt_issuer: str | None = None
    supabase_jwt_audience: str = "authenticated"
    supabase_jwks_url: AnyHttpUrl | None = None
    railway_backend_url: AnyHttpUrl = Field(
        default=AnyHttpUrl("https://pixtallbackend-production-9ec3.up.railway.app/generate_image")
    )
    worker_concurrency: int = Field(default=4, ge=1, le=32)
    worker_poll_seconds: float = Field(default=1, ge=0.1)
    worker_lease_seconds: int = Field(default=300, ge=30)
    backend_max_attempts: int = Field(default=4, ge=1, le=10)
    backend_timeout_seconds: float = Field(default=180, ge=1)
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    admin_credit_grants_enabled: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @field_validator("database_url", mode="before")
    @classmethod
    def select_psycopg_driver(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)
        return value

    @model_validator(mode="after")
    def secure_production_auth(self) -> "Settings":
        if self.app_env == "production" and self.auth_mode == "development":
            raise ValueError("AUTH_MODE=development is forbidden in production")
        if self.auth_mode == "supabase" and not (
            self.supabase_jwt_issuer and self.supabase_jwks_url
        ):
            raise ValueError("Supabase authentication requires issuer and JWKS URL")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
