import os
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import Session

from pixtall.api import current_identity, login, signup, verify_signup_email
from pixtall.auth import (
    EmailVerificationRequest,
    LoginRequest,
    SignupRequest,
    hash_email_verification_code,
)
from pixtall.core import (
    Base,
    CreditGrant,
    GenerationRequest,
    ImageQuality,
    JobStatus,
    Plan,
    Settings,
    Subscription,
    User,
    Wallet,
    settle_job,
    submit_job,
)

DATABASE_URL = os.getenv("TEST_DATABASE_URL")
pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not DATABASE_URL, reason="TEST_DATABASE_URL is not set"),
]


@pytest.fixture
def session() -> Session:
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    connection = engine.connect()
    transaction = connection.begin()
    connection.execute(text("SET LOCAL statement_timeout = '10s'"))
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


def seeded_user(session: Session) -> tuple[User, Wallet]:
    user = User(id=uuid4(), email=f"{uuid4()}@example.com")
    plan = Plan(
        code=f"t-{uuid4().hex}",
        name="Test",
        base_price_paise=100,
        included_credits=100,
        standard_image_credits=10,
        premium_image_credits=20,
        recurring=False,
        active=True,
    )
    wallet = Wallet(user_id=user.id, available_credits=100)
    session.add_all([user, plan, wallet])
    session.flush()
    session.add(
        Subscription(user_id=user.id, plan_id=plan.id, status="active", starts_at=datetime.now(UTC))
    )
    session.add(
        CreditGrant(
            user_id=user.id,
            plan_id=plan.id,
            source_type="test",
            provider_reference=f"test:{user.id}",
            granted_credits=100,
            available_credits=100,
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
    )
    session.commit()
    return user, wallet


def generation_request(count: int = 2) -> GenerationRequest:
    return GenerationRequest(
        product_image_base64="data:image/png;base64,AA==",
        product_category="fashion",
        product_subcategory="shirt",
        scene="studio",
        size="1:1",
        model="none",
        intended_use="marketplace",
        image_count=count,
        quality=ImageQuality.STANDARD,
    )


def test_custom_signup_and_login_use_the_railway_users_table(
    session: Session,
    monkeypatch,
) -> None:
    email = f"integration-{uuid4().hex}@example.com"
    settings = Settings(
        _env_file=None,
        app_env="test",
        auth_mode="custom",
        database_url=DATABASE_URL,
        jwt_secret="integration-test-secret",
        smtp_host="smtp.example.com",
        smtp_username="mailer@example.com",
        smtp_password="app-password",
        smtp_from_email="mailer@example.com",
    )
    monkeypatch.setattr(
        "pixtall.api.create_email_verification_code",
        lambda requested_email, secret: (
            "471208",
            hash_email_verification_code(requested_email, "471208", secret),
        ),
    )
    monkeypatch.setattr("pixtall.api.send_email_verification_code", lambda *args, **kwargs: None)
    signup(
        SignupRequest(email=email, password="integration-password", name="Integration User"),
        settings,
        session,
    )
    created = verify_signup_email(
        EmailVerificationRequest(email=email, code="471208"),
        settings,
        session,
    )
    identity = current_identity(f"Bearer {created.access_token}", settings, session)
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == identity.user_id))
    assert identity.email == email
    assert wallet is not None
    assert wallet.available_credits == 0

    authenticated = login(
        LoginRequest(email=email, password="integration-password"),
        session,
    )
    assert current_identity(
        f"Bearer {authenticated.access_token}", settings, session
    ).user_id == identity.user_id


def test_reservation_and_partial_settlement_are_idempotent(session: Session) -> None:
    user, _ = seeded_user(session)
    job = submit_job(
        session, user_id=user.id, idempotency_key="request-0001", request=generation_request()
    )
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == user.id))
    assert (wallet.available_credits, wallet.reserved_credits) == (80, 20)

    settle_job(
        session, job_id=job.id, results=["https://cdn.example/0.png", None], errors={1: "failed"}
    )
    settle_job(
        session, job_id=job.id, results=[None, None], errors={0: "duplicate", 1: "duplicate"}
    )
    session.expire_all()
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == user.id))
    settled = session.get(type(job), job.id)
    assert (
        wallet.available_credits,
        wallet.reserved_credits,
        wallet.lifetime_consumed_credits,
    ) == (90, 0, 10)
    assert settled.status == JobStatus.PARTIALLY_COMPLETED


def test_duplicate_idempotency_key_returns_same_job(session: Session) -> None:
    user, _ = seeded_user(session)
    first = submit_job(
        session, user_id=user.id, idempotency_key="request-0002", request=generation_request(1)
    )
    second = submit_job(
        session, user_id=user.id, idempotency_key="request-0002", request=generation_request(1)
    )
    assert first.id == second.id
