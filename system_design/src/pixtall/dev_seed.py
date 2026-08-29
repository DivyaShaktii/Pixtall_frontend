from datetime import UTC, datetime

from sqlalchemy import select

from pixtall.config import get_settings
from pixtall.db import SessionFactory
from pixtall.models import Plan, Subscription, User, Wallet


def run() -> None:
    settings = get_settings()
    if settings.app_env != "development":
        raise RuntimeError("Development seed is disabled outside APP_ENV=development")
    with SessionFactory.begin() as session:
        user = session.get(User, settings.dev_user_id)
        if user is None:
            session.add(
                User(
                    id=settings.dev_user_id,
                    email="admin@pixstall.ai",
                    name="Local Developer",
                )
            )
            session.flush()
        else:
            user.email = "admin@pixstall.ai"
        if session.scalar(select(Wallet).where(Wallet.user_id == settings.dev_user_id)) is None:
            session.add(Wallet(user_id=settings.dev_user_id, available_credits=10_000))
        active = session.scalar(
            select(Subscription).where(
                Subscription.user_id == settings.dev_user_id,
                Subscription.status == "active",
            )
        )
        if active is None:
            plan = session.scalar(select(Plan).where(Plan.code == "creator"))
            if plan is None:
                raise RuntimeError("Run Alembic migrations before the development seed")
            session.add(
                Subscription(
                    user_id=settings.dev_user_id,
                    plan_id=plan.id,
                    status="active",
                    starts_at=datetime.now(UTC),
                )
            )


if __name__ == "__main__":
    run()
