from dataclasses import dataclass
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException, status
from jwt import PyJWKClient

from pixtall.config import Settings, get_settings


@dataclass(frozen=True)
class Identity:
    user_id: UUID


def _bearer_token(authorization: str | None) -> str:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required"
        )
    return token


def current_identity(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> Identity:
    if settings.auth_mode == "development":
        return Identity(settings.dev_user_id)

    token = _bearer_token(authorization)
    try:
        jwks = PyJWKClient(str(settings.supabase_jwks_url))
        key = jwks.get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256", "ES256"],
            audience=settings.supabase_jwt_audience,
            issuer=settings.supabase_jwt_issuer,
        )
        return Identity(UUID(claims["sub"]))
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token"
        ) from exc
