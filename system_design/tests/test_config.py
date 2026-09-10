import pytest
from pydantic import ValidationError

from pixtall.core import Settings


def test_development_auth_is_rejected_in_production() -> None:
    with pytest.raises(ValidationError, match="forbidden in production"):
        Settings(_env_file=None, app_env="production", auth_mode="development")


def test_default_jwt_secret_is_rejected_for_custom_auth_in_production() -> None:
    with pytest.raises(ValidationError, match="secure JWT_SECRET"):
        Settings(_env_file=None, app_env="production", auth_mode="custom")


@pytest.mark.parametrize("scheme", ["postgres", "postgresql"])
def test_railway_database_url_selects_installed_psycopg_driver(scheme: str) -> None:
    settings = Settings(
        _env_file=None,
        database_url=f"{scheme}://user:password@database.example/postgres",
    )
    assert settings.database_url.startswith("postgresql+psycopg://")
