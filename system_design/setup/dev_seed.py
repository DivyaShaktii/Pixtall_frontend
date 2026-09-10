from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from pixtall.auth import hash_password
from pixtall.core import (
    CreditGrant,
    CreditTransaction,
    Plan,
    SessionFactory,
    Subscription,
    TransactionType,
    User,
    Wallet,
    get_settings,
)

DEMO_EMAIL = "demo@pixtall.dev"
DEMO_NAME = "Pixtall Demo User"
DEMO_PASSWORD = "123456"


def run() -> None:
    settings = get_settings()
    if settings.app_env != "development":
        raise RuntimeError("Development seed is disabled outside APP_ENV=development")
    with SessionFactory.begin() as session:
        now = datetime.now(UTC)
        user = session.get(User, settings.dev_user_id)
        if user is None:
            user = User(
                id=settings.dev_user_id,
                email=DEMO_EMAIL,
                name=DEMO_NAME,
                hashed_password=hash_password(DEMO_PASSWORD),
                auth_version=0,
            )
            session.add(user)
            session.flush()
        else:
            user.email = DEMO_EMAIL
            user.name = DEMO_NAME
            user.hashed_password = hash_password(DEMO_PASSWORD)
        wallet = session.scalar(select(Wallet).where(Wallet.user_id == settings.dev_user_id))
        if wallet is None:
            wallet = Wallet(user_id=settings.dev_user_id, available_credits=10_000)
            session.add(wallet)
        creator_plan = session.scalar(select(Plan).where(Plan.code == "creator"))
        if creator_plan is None:
            raise RuntimeError("Run Alembic migrations before the development seed")
        active = session.scalar(
            select(Subscription).where(
                Subscription.user_id == settings.dev_user_id,
                Subscription.status == "active",
            )
        )
        if active is None:
            active = Subscription(
                user_id=settings.dev_user_id,
                plan_id=creator_plan.id,
                status="active",
                payment_status="test",
                starts_at=now,
                current_period_start=now,
                current_period_end=now + timedelta(days=31),
                renews_at=now + timedelta(days=31),
                base_amount_paise=0,
                gst_amount_paise=0,
                total_amount_paise=0,
            )
            session.add(active)
        else:
            active.plan_id = creator_plan.id
            active.payment_status = "test"
            active.base_amount_paise = 0
            active.gst_amount_paise = 0
            active.total_amount_paise = 0
            active.current_period_start = active.current_period_start or now
            active.current_period_end = active.current_period_end or now + timedelta(days=31)
            active.renews_at = active.renews_at or active.current_period_end
        seed_reference = f"development-seed:{settings.dev_user_id}"
        grant = session.scalar(
            select(CreditGrant).where(CreditGrant.provider_reference == seed_reference)
        )
        if grant is None:
            grant = CreditGrant(
                user_id=settings.dev_user_id,
                plan_id=creator_plan.id,
                source_type="development",
                provider_reference=seed_reference,
                granted_credits=10_000,
                available_credits=10_000,
                expires_at=now + timedelta(days=3650),
            )
            session.add(grant)
            session.flush()
        ledger_entry = session.scalar(
            select(CreditTransaction).where(
                CreditTransaction.external_reference == seed_reference,
                CreditTransaction.user_id == settings.dev_user_id,
                CreditTransaction.type == TransactionType.GRANTED,
            )
        )
        grants = list(
            session.scalars(
                select(CreditGrant).where(CreditGrant.user_id == settings.dev_user_id)
            )
        )
        wallet.available_credits = sum(item.available_credits for item in grants)
        wallet.reserved_credits = sum(item.reserved_credits for item in grants)
        if ledger_entry is None:
            session.add(
                CreditTransaction(
                    user_id=settings.dev_user_id,
                    grant_id=grant.id,
                    external_reference=seed_reference,
                    type=TransactionType.GRANTED,
                    credits=grant.granted_credits,
                    available_balance_after=wallet.available_credits,
                    reserved_balance_after=wallet.reserved_credits,
                )
            )


if __name__ == "__main__":
    run()
