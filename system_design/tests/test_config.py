import pytest
from pydantic import ValidationError

from pixtall.config import Settings


def test_development_auth_is_rejected_in_production() -> None:
    with pytest.raises(ValidationError, match="forbidden in production"):
        Settings(_env_file=None, app_env="production", auth_mode="development")


def test_supabase_auth_requires_jwks_configuration() -> None:
    with pytest.raises(ValidationError, match="issuer and JWKS"):
        Settings(_env_file=None, auth_mode="supabase")


@pytest.mark.parametrize("scheme", ["postgres", "postgresql"])
def test_supabase_database_url_selects_installed_psycopg_driver(scheme: str) -> None:
    settings = Settings(
        _env_file=None,
        database_url=f"{scheme}://user:password@database.example/postgres",
    )
    assert settings.database_url.startswith("postgresql+psycopg://")
