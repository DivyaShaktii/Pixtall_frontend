import sys
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from pixtall.core import (
    CreditGrant,
    CreditTransaction,
    Plan,
    Subscription,
    TransactionType,
    User,
    Wallet,
    get_session,
)


def grant_plan(email: str, plan_code: str = "creator") -> None:
    with next(get_session()) as session:
        user = session.scalar(select(User).where(User.email == email))
        if not user:
            print(f"User '{email}' not found in the database.")
            print(
                "Please sign into the frontend once so the account is created, "
                "or provide the correct email."
            )
            return

        plan = session.scalar(select(Plan).where(Plan.code == plan_code))
        if not plan:
            print(f"Plan '{plan_code}' not found in DB.")
            return

        now = datetime.now(UTC)

        # Cancel existing active subscriptions
        active_subs = session.scalars(
            select(Subscription)
            .where(Subscription.user_id == user.id, Subscription.status == "active")
        )
        for s in active_subs:
            s.status = "cancelled"
            s.cancel_at_period_end = False
            s.current_period_end = now

        sub = Subscription(
            user_id=user.id,
            plan_id=plan.id,
            status="active",
            payment_status="paid",
            base_amount_paise=plan.base_price_paise,
            gst_amount_paise=0,
            total_amount_paise=plan.base_price_paise,
            starts_at=now,
            renews_at=now + timedelta(days=31),
            current_period_start=now,
            current_period_end=now + timedelta(days=31),
            provider_subscription_id=f"sub_manual_{int(now.timestamp())}",
        )
        session.add(sub)

        wallet = session.scalar(select(Wallet).where(Wallet.user_id == user.id))
        if not wallet:
            wallet = Wallet(user_id=user.id, available_credits=0)
            session.add(wallet)

        session.flush()

        grant = CreditGrant(
            user_id=user.id,
            plan_id=plan.id,
            source_type="subscription_cycle",
            provider_reference=f"manual_{now.timestamp()}",
            granted_credits=plan.included_credits,
            available_credits=plan.included_credits,
            expires_at=now + timedelta(days=31),
        )
        session.add(grant)
        wallet.available_credits += plan.included_credits

        session.add(
            CreditTransaction(
                user_id=user.id,
                grant_id=grant.id,
                external_reference=grant.provider_reference,
                type=TransactionType.GRANTED,
                credits=plan.included_credits,
                available_balance_after=wallet.available_credits,
                reserved_balance_after=wallet.reserved_credits,
            )
        )

        session.commit()
        print(
            f"Successfully granted {plan.name} plan to {email} "
            f"with {plan.included_credits} credits."
        )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python grant_plan.py <email>")
    else:
        grant_plan(sys.argv[1])
