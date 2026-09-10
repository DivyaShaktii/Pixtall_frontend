import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import bcrypt
import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from pixtall.core import get_settings


class SignupRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class EmailVerificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class EmailVerificationResendRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class GoogleAuthRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    credential: str = Field(min_length=1, max_length=8192)


class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: str = Field(min_length=32, max_length=512)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_password(self) -> "ChangePasswordRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if len(self.password.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes")
        return self


class GoogleIdentity(BaseModel):
    subject: str
    email: EmailStr
    name: str | None = None


class GoogleAuthenticationError(ValueError):
    pass


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class MessageResponse(BaseModel):
    message: str


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def hash_password_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_password_reset_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hash_password_reset_token(token)


def hash_email_verification_code(email: str, code: str, secret: str) -> str:
    message = f"{email.strip().lower()}:{code}".encode()
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()


def create_email_verification_code(email: str, secret: str) -> tuple[str, str]:
    code = f"{secrets.randbelow(1_000_000):06d}"
    return code, hash_email_verification_code(email, code, secret)


def verify_google_credential(credential: str, client_id: str | None) -> GoogleIdentity:
    if not client_id:
        raise GoogleAuthenticationError("Google sign-in is not configured")

    try:
        claims = google_id_token.verify_oauth2_token(  # type: ignore[no-untyped-call]
            credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError as exc:
        raise GoogleAuthenticationError("Invalid Google credential") from exc

    email = str(claims.get("email") or "").strip().lower()
    subject = str(claims.get("sub") or "").strip()
    email_verified = claims.get("email_verified")
    if not subject or not email or email_verified not in {True, "true"}:
        raise GoogleAuthenticationError("Google account email is not verified")

    raw_name = str(claims.get("name") or "").strip()
    return GoogleIdentity(
        subject=subject,
        email=email,
        name=raw_name[:200] or None,
    )


def create_access_token(
    user_id: str,
    email: str | None,
    name: str | None,
    auth_version: int = 0,
) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.jwt_expires_in_minutes)

    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "ver": auth_version,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "jti": str(uuid4()),
        "iat": now,
        "nbf": now,
        "exp": expire,
    }

    encoded_jwt = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt
