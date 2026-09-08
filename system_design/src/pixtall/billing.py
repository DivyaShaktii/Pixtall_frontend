import hashlib
import hmac
from contextlib import suppress
from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from uuid import UUID

import httpx
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from pixtall.core import (
    BillingPayment,
    CreditGrant,
    CreditTransaction,
    Plan,
    Settings,
    Subscription,
    TransactionType,
    User,
    Wallet,
    WebhookEvent,
    expire_credit_grants,
)


class BillingError(Exception):
    pass


class BillingConfigurationError(BillingError):
    pass


class ProviderRequestError(BillingError):
    pass


class PlanResponse(BaseModel):
    code: str
    name: str
    final_price_paise: int
    final_price_usd_cents: int
    currency: Literal["INR", "USD"] = "INR"
    gst_inclusive: bool = True
    included_credits: int
    standard_image_credits: int
    premium_image_credits: int
    recurring: bool
    credit_expiry: Literal["billing_cycle", "six_months"]


class AccountResponse(BaseModel):
    id: UUID
    email: str | None
    name: str | None
    has_password: bool = False


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plan_code: Literal["payg", "creator", "pro", "business"]
    currency: Literal["INR", "USD"] = "INR"


class CheckoutResponse(BaseModel):
    checkout_id: UUID
    plan_code: str
    checkout_type: Literal["order", "subscription"]
    key_id: str
    name: str
    description: str
    currency: Literal["INR", "USD"] = "INR"
    amount: int | None = None
    order_id: str | None = None
    subscription_id: str | None = None
    prefill_name: str | None = None
    prefill_email: str | None = None


class ConfirmRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    checkout_id: UUID
    razorpay_payment_id: str = Field(min_length=1, max_length=200)
    razorpay_signature: str = Field(min_length=1, max_length=500)
    razorpay_order_id: str | None = Field(default=None, max_length=200)
    razorpay_subscription_id: str | None = Field(default=None, max_length=200)


class ConfirmResponse(BaseModel):
    status: Literal["processing", "paid", "failed"]
    available_credits: int


class SubscriptionSummary(BaseModel):
    plan_code: str
    plan_name: str
    status: str
    current_period_start: datetime | None
    current_period_end: datetime | None
    cancel_at_period_end: bool


class CreditGrantSummary(BaseModel):
    source_type: str
    available_credits: int
    reserved_credits: int
    expires_at: datetime


class PaymentResponse(BaseModel):
    id: UUID
    plan_code: str
    plan_name: str
    kind: str
    status: str
    total_amount_paise: int
    base_amount_paise: int
    gst_amount_paise: int
    currency: str
    provider_payment_id: str | None
    captured_at: datetime | None
    review_required: bool
    created_at: datetime


class BillingSummary(BaseModel):
    available_credits: int
    reserved_credits: int
    lifetime_consumed_credits: int
    subscription: SubscriptionSummary | None
    credit_grants: list[CreditGrantSummary]
    latest_payment: PaymentResponse | None


class PaymentPage(BaseModel):
    items: list[PaymentResponse]
    limit: int
    offset: int


class CancelResponse(BaseModel):
    status: str
    cancel_at_period_end: bool
    current_period_end: datetime | None


def _require_billing(settings: Settings) -> None:
    if not settings.billing_enabled:
        raise BillingConfigurationError("Billing is not enabled")
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise BillingConfigurationError("Razorpay API credentials are missing")


def _provider_request(
    settings: Settings,
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
) -> dict[str, Any]:
    _require_billing(settings)
    try:
        response = httpx.request(
            method,
            f"{str(settings.razorpay_api_base_url).rstrip('/')}/{path.lstrip('/')}",
            auth=(settings.razorpay_key_id or "", settings.razorpay_key_secret or ""),
            json=json,
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ProviderRequestError("Razorpay returned an invalid response")
        return payload
    except (httpx.HTTPError, ValueError) as exc:
        raise ProviderRequestError("Razorpay request failed") from exc


def _inclusive_tax(total_paise: int, rate_bps: int) -> tuple[int, int]:
    base = round(total_paise * 10_000 / (10_000 + rate_bps)) if rate_bps else total_paise
    return base, total_paise - base


def _timestamp(value: object) -> datetime | None:
    if not isinstance(value, (int, float)) or value <= 0:
        return None
    return datetime.fromtimestamp(value, tz=UTC)


def _payment_response(payment: BillingPayment, plan: Plan) -> PaymentResponse:
    return PaymentResponse(
        id=payment.id,
        plan_code=plan.code,
        plan_name=plan.name,
        kind=payment.kind,
        status=payment.status,
        total_amount_paise=payment.total_amount_paise,
        base_amount_paise=payment.base_amount_paise,
        gst_amount_paise=payment.gst_amount_paise,
        currency=payment.currency,
        provider_payment_id=payment.provider_payment_id,
        captured_at=payment.captured_at,
        review_required=payment.review_required,
        created_at=payment.created_at,
    )


def list_plans(session: Session) -> list[PlanResponse]:
    plans = list(
        session.scalars(
            select(Plan).where(Plan.active.is_(True)).order_by(Plan.base_price_paise)
        )
    )
    return [
        PlanResponse(
            code=plan.code,
            name=plan.name,
            final_price_paise=plan.base_price_paise,
            final_price_usd_cents=plan.base_price_usd_cents,
            included_credits=plan.included_credits,
            standard_image_credits=plan.standard_image_credits,
            premium_image_credits=plan.premium_image_credits,
            recurring=plan.recurring,
            credit_expiry="billing_cycle" if plan.recurring else "six_months",
        )
        for plan in plans
    ]


def bootstrap_account(
    session: Session,
    *,
    user_id: UUID,
    email: str | None,
    name: str | None,
) -> AccountResponse:
    user = session.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=email, name=name)
        session.add(user)
        session.flush()
    else:
        if email:
            user.email = email
        if name:
            user.name = name
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == user_id))
    if wallet is None:
        session.add(Wallet(user_id=user_id, available_credits=0))
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        user = session.get(User, user_id)
        if user is None:
            raise
    return AccountResponse(
        id=user_id,
        email=user.email if user else email,
        name=user.name if user else name,
        has_password=bool(user and user.hashed_password),
    )


def _checkout_response(
    payment: BillingPayment, plan: Plan, user: User, settings: Settings, currency: Literal["INR", "USD"] = "INR"
) -> CheckoutResponse:
    amount = None
    if not plan.recurring:
        amount = plan.base_price_paise if currency == "INR" else plan.base_price_usd_cents

    return CheckoutResponse(
        checkout_id=payment.id,
        plan_code=plan.code,
        checkout_type="subscription" if plan.recurring else "order",
        key_id=settings.razorpay_key_id or "",
        name=settings.checkout_brand,
        description=f"{plan.name} · {plan.included_credits:,} credits",
        amount=amount,
        currency=currency,
        order_id=payment.provider_order_id,
        subscription_id=payment.provider_subscription_id,
        prefill_name=user.name,
        prefill_email=user.email,
    )


def create_checkout(
    session: Session,
    *,
    user_id: UUID,
    idempotency_key: str,
    plan_code: str,
    currency: Literal["INR", "USD"],
    settings: Settings,
) -> CheckoutResponse:
    _require_billing(settings)
    existing = session.scalar(
        select(BillingPayment).where(
            BillingPayment.user_id == user_id,
            BillingPayment.idempotency_key == idempotency_key,
        )
    )
    if existing:
        plan = session.get(Plan, existing.plan_id)
        user = session.get(User, user_id)
        if plan is None or user is None:
            raise BillingError("Checkout account is incomplete")
        return _checkout_response(existing, plan, user, settings, currency=currency)

    plan = session.scalar(select(Plan).where(Plan.code == plan_code, Plan.active.is_(True)))
    user = session.get(User, user_id)
    if plan is None:
        raise BillingError("Plan is unavailable")
    if user is None:
        raise BillingError("Account must be provisioned before checkout")
    if plan.recurring:
        active_subs = session.scalars(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status.in_(
                    ["created", "authenticated", "active", "pending", "halted"]
                ),
            )
        )
        for active in active_subs:
            active.status = "cancelled"
            active.cancel_at_period_end = False
            active.current_period_end = datetime.now(UTC)
            if active.provider_subscription_id:
                with suppress(ProviderRequestError):
                    _provider_request(
                        settings,
                        "POST",
                        f"/subscriptions/{active.provider_subscription_id}/cancel",
                        json={"cancel_at_cycle_end": 0},
                    )

    amount_to_charge = plan.base_price_paise if currency == "INR" else plan.base_price_usd_cents
    tax_rate = settings.gst_rate_bps if currency == "INR" else 0
    base, gst = _inclusive_tax(amount_to_charge, tax_rate)
    payment = BillingPayment(
        user_id=user_id,
        plan_id=plan.id,
        idempotency_key=idempotency_key,
        kind="subscription" if plan.recurring else "payg",
        base_amount_paise=base,
        gst_amount_paise=gst,
        total_amount_paise=amount_to_charge,
        currency=currency,
    )
    session.add(payment)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        duplicate = session.scalar(
            select(BillingPayment).where(
                BillingPayment.user_id == user_id,
                BillingPayment.idempotency_key == idempotency_key,
            )
        )
        if duplicate is None:
            raise
        duplicate_plan = session.get(Plan, duplicate.plan_id)
        duplicate_user = session.get(User, user_id)
        if duplicate_plan is None or duplicate_user is None:
            raise BillingError("Checkout account is incomplete") from None
        return _checkout_response(duplicate, duplicate_plan, duplicate_user, settings, currency=currency)
    notes = {"checkout_id": str(payment.id), "user_id": str(user_id), "plan_code": plan.code}
    if plan.recurring:
        plan_ids = settings.razorpay_plan_ids if currency == "INR" else settings.razorpay_usd_plan_ids
        provider_plan_id = plan_ids.get(plan.code)
        if not provider_plan_id:
            raise BillingConfigurationError(f"Razorpay Plan ID is missing for {plan.code} ({currency})")
        provider = _provider_request(
            settings,
            "POST",
            "/subscriptions",
            json={
                "plan_id": provider_plan_id,
                "total_count": settings.razorpay_subscription_total_count,
                "quantity": 1,
                "customer_notify": True,
                "notes": notes,
            },
        )
        provider_id = str(provider.get("id") or "")
        if not provider_id:
            raise ProviderRequestError("Razorpay did not create a subscription")
        payment.provider_subscription_id = provider_id
        session.add(
            Subscription(
                user_id=user_id,
                plan_id=plan.id,
                status=str(provider.get("status") or "created"),
                payment_status="pending",
                base_amount_paise=base,
                gst_amount_paise=gst,
                total_amount_paise=plan.base_price_paise,
                starts_at=datetime.now(UTC),
                provider_subscription_id=provider_id,
                provider_plan_id=provider_plan_id,
                current_period_start=_timestamp(provider.get("current_start")),
                current_period_end=_timestamp(provider.get("current_end")),
                renews_at=_timestamp(provider.get("charge_at")),
            )
        )
    else:
        provider = _provider_request(
            settings,
            "POST",
            "/orders",
            json={
                "amount": amount_to_charge,
                "currency": currency,
                "receipt": f"pixtall-{payment.id}",
                "notes": notes,
            },
        )
        provider_id = str(provider.get("id") or "")
        if not provider_id:
            raise ProviderRequestError("Razorpay did not create an order")
        payment.provider_order_id = provider_id
    session.commit()
    session.refresh(payment)
    return _checkout_response(payment, plan, user, settings, currency=currency)


def _wallet_for_update(session: Session, user_id: UUID) -> Wallet:
    wallet = session.scalar(select(Wallet).where(Wallet.user_id == user_id).with_for_update())
    if wallet is None:
        raise BillingError("Wallet not found")
    return wallet


def _add_grant(
    session: Session,
    *,
    payment: BillingPayment,
    plan: Plan,
    source_type: str,
    provider_reference: str,
    expires_at: datetime,
) -> CreditGrant:
    existing = session.scalar(
        select(CreditGrant).where(CreditGrant.provider_reference == provider_reference)
    )
    if existing:
        return existing
    wallet = _wallet_for_update(session, payment.user_id)
    expire_credit_grants(session, user_id=payment.user_id, wallet=wallet)
    grant = CreditGrant(
        user_id=payment.user_id,
        plan_id=plan.id,
        billing_payment_id=payment.id,
        source_type=source_type,
        provider_reference=provider_reference,
        granted_credits=plan.included_credits,
        available_credits=plan.included_credits,
        expires_at=expires_at,
    )
    session.add(grant)
    session.flush()
    wallet.available_credits += plan.included_credits
    session.add(
        CreditTransaction(
            user_id=payment.user_id,
            grant_id=grant.id,
            external_reference=provider_reference,
            type=(TransactionType.GRANTED if plan.recurring else TransactionType.PURCHASED),
            credits=plan.included_credits,
            available_balance_after=wallet.available_credits,
            reserved_balance_after=wallet.reserved_credits,
        )
    )
    return grant


def fulfill_order(
    session: Session,
    *,
    order: dict[str, Any],
    payment_entity: dict[str, Any],
) -> BillingPayment:
    order_id = str(order.get("id") or payment_entity.get("order_id") or "")
    payment = session.scalar(
        select(BillingPayment).where(BillingPayment.provider_order_id == order_id).with_for_update()
    )
    if payment is None:
        raise BillingError("Unknown Razorpay order")
    plan = session.get(Plan, payment.plan_id)
    if plan is None:
        raise BillingError("Plan not found")
    provider_payment_id = str(payment_entity.get("id") or "")
    if not provider_payment_id:
        raise BillingError("Razorpay payment ID is missing")
    paid_amount = int(payment_entity.get("amount") or order.get("amount_paid") or 0)
    if paid_amount != payment.total_amount_paise:
        raise BillingError("Captured amount does not match checkout")
    if str(payment_entity.get("currency") or order.get("currency") or "") != payment.currency:
        raise BillingError("Captured currency does not match checkout")
    if str(payment_entity.get("status") or "") != "captured" and not payment_entity.get("captured"):
        raise BillingError("Payment is not captured")
    if payment.status == "paid":
        return payment
    payment.provider_payment_id = provider_payment_id
    payment.status = "paid"
    payment.captured_at = _timestamp(payment_entity.get("created_at")) or datetime.now(UTC)
    _add_grant(
        session,
        payment=payment,
        plan=plan,
        source_type="payg",
        provider_reference=f"payg:{provider_payment_id}",
        expires_at=payment.captured_at + timedelta(days=183),
    )
    session.commit()
    return payment


def _subscription_for_update(session: Session, provider_subscription_id: str) -> Subscription:
    subscription = session.scalar(
        select(Subscription)
        .where(Subscription.provider_subscription_id == provider_subscription_id)
        .with_for_update()
    )
    if subscription is None:
        raise BillingError("Unknown Razorpay subscription")
    return subscription


def fulfill_subscription_charge(
    session: Session,
    *,
    subscription_entity: dict[str, Any],
    payment_entity: dict[str, Any],
    invoice_entity: dict[str, Any] | None = None,
) -> BillingPayment:
    provider_subscription_id = str(
        subscription_entity.get("id") or payment_entity.get("subscription_id") or ""
    )
    subscription = _subscription_for_update(session, provider_subscription_id)
    plan = session.get(Plan, subscription.plan_id)
    if plan is None:
        raise BillingError("Subscription plan not found")
    provider_payment_id = str(payment_entity.get("id") or "")
    if not provider_payment_id:
        raise BillingError("Subscription payment ID is missing")
    existing = session.scalar(
        select(BillingPayment).where(BillingPayment.provider_payment_id == provider_payment_id)
    )
    if existing and existing.status == "paid":
        return existing
    if int(payment_entity.get("amount") or 0) != plan.base_price_paise:
        raise BillingError("Subscription charge amount does not match plan")
    if str(payment_entity.get("currency") or "") != "INR":
        raise BillingError("Subscription charge currency does not match plan")
    if str(payment_entity.get("status") or "") != "captured" and not payment_entity.get("captured"):
        raise BillingError("Subscription charge is not captured")

    payment = existing or session.scalar(
        select(BillingPayment)
        .where(
            BillingPayment.provider_subscription_id == provider_subscription_id,
            BillingPayment.provider_payment_id.is_(None),
        )
        .order_by(BillingPayment.created_at)
        .limit(1)
        .with_for_update()
    )
    base = subscription.base_amount_paise or plan.base_price_paise
    gst = subscription.gst_amount_paise or 0
    if payment is None:
        payment = BillingPayment(
            user_id=subscription.user_id,
            plan_id=plan.id,
            idempotency_key=f"razorpay:{provider_payment_id}",
            kind="subscription",
            provider_subscription_id=provider_subscription_id,
            base_amount_paise=base,
            gst_amount_paise=gst,
            total_amount_paise=plan.base_price_paise,
            currency="INR",
        )
        session.add(payment)
        session.flush()
    payment.provider_payment_id = provider_payment_id
    payment.provider_invoice_id = str((invoice_entity or {}).get("id") or "") or None
    payment.status = "paid"
    payment.captured_at = _timestamp(payment_entity.get("created_at")) or datetime.now(UTC)

    current_start = _timestamp(subscription_entity.get("current_start")) or payment.captured_at
    current_end = _timestamp(subscription_entity.get("current_end"))
    if current_end is None or current_end <= current_start:
        current_end = current_start + timedelta(days=31)
    subscription.status = "active"
    subscription.payment_id = provider_payment_id
    subscription.payment_status = "paid"
    subscription.current_period_start = current_start
    subscription.current_period_end = current_end
    subscription.renews_at = _timestamp(subscription_entity.get("charge_at")) or current_end
    subscription.paid_cycle_reference = payment.provider_invoice_id or provider_payment_id
    _add_grant(
        session,
        payment=payment,
        plan=plan,
        source_type="subscription_cycle",
        provider_reference=f"subscription:{payment.provider_invoice_id or provider_payment_id}",
        expires_at=current_end,
    )
    session.commit()
    return payment


def update_subscription_status(session: Session, entity: dict[str, Any], event_type: str) -> None:
    provider_id = str(entity.get("id") or "")
    subscription = _subscription_for_update(session, provider_id)
    subscription.status = str(entity.get("status") or event_type.removeprefix("subscription."))
    subscription.current_period_start = (
        _timestamp(entity.get("current_start")) or subscription.current_period_start
    )
    subscription.current_period_end = (
        _timestamp(entity.get("current_end")) or subscription.current_period_end
    )
    subscription.renews_at = _timestamp(entity.get("charge_at")) or subscription.renews_at
    if event_type == "subscription.cancelled":
        subscription.cancel_at_period_end = False
    session.commit()


def refund_payment(session: Session, payment_entity: dict[str, Any]) -> None:
    provider_payment_id = str(payment_entity.get("id") or "")
    payment = session.scalar(
        select(BillingPayment)
        .where(BillingPayment.provider_payment_id == provider_payment_id)
        .with_for_update()
    )
    if payment is None:
        raise BillingError("Unknown refunded payment")
    cumulative_refund = min(
        int(payment_entity.get("amount_refunded") or payment.total_amount_paise),
        payment.total_amount_paise,
    )
    if cumulative_refund <= payment.refunded_amount_paise:
        return
    wallet = _wallet_for_update(session, payment.user_id)
    grants = list(
        session.scalars(
            select(CreditGrant)
            .where(CreditGrant.billing_payment_id == payment.id)
            .with_for_update()
        )
    )
    shortfall = 0
    for grant in grants:
        target = round(grant.granted_credits * cumulative_refund / payment.total_amount_paise)
        needed = max(0, target - grant.refunded_credits)
        available = min(grant.available_credits, needed)
        grant.available_credits -= available
        grant.refunded_credits += available
        shortfall += needed - available
        if grant.reserved_credits == 0 and grant.available_credits == 0:
            grant.status = "refunded"
        if available:
            wallet.available_credits -= available
            session.add(
                CreditTransaction(
                    user_id=payment.user_id,
                    grant_id=grant.id,
                    external_reference=f"refund:{provider_payment_id}",
                    type=TransactionType.REFUNDED,
                    credits=available,
                    available_balance_after=wallet.available_credits,
                    reserved_balance_after=wallet.reserved_credits,
                )
            )
    payment.refunded_amount_paise = cumulative_refund
    payment.status = (
        "refunded" if cumulative_refund == payment.total_amount_paise else "partially_refunded"
    )
    payment.review_required = shortfall > 0
    payment.failure_reason = (
        f"Refund requires review: {shortfall} credits were consumed or reserved"
        if shortfall
        else None
    )
    session.commit()


def confirm_checkout(
    session: Session,
    *,
    user_id: UUID,
    request: ConfirmRequest,
    settings: Settings,
) -> ConfirmResponse:
    _require_billing(settings)
    payment = session.scalar(
        select(BillingPayment).where(
            BillingPayment.id == request.checkout_id,
            BillingPayment.user_id == user_id,
        )
    )
    if payment is None:
        raise BillingError("Checkout not found")
    secret = (settings.razorpay_key_secret or "").encode()
    if payment.kind == "payg":
        if not payment.provider_order_id or request.razorpay_order_id != payment.provider_order_id:
            raise BillingError("Order does not belong to this checkout")
        message = f"{payment.provider_order_id}|{request.razorpay_payment_id}".encode()
    else:
        if (
            not payment.provider_subscription_id
            or request.razorpay_subscription_id != payment.provider_subscription_id
        ):
            raise BillingError("Subscription does not belong to this checkout")
        message = f"{request.razorpay_payment_id}|{payment.provider_subscription_id}".encode()
    expected = hmac.new(secret, message, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.razorpay_signature):
        raise BillingError("Invalid checkout signature")

    provider_payment = _provider_request(
        settings, "GET", f"/payments/{request.razorpay_payment_id}"
    )
    if str(provider_payment.get("status") or "") != "captured":
        wallet = _wallet_for_update(session, user_id)
        return ConfirmResponse(
            status="processing",
            available_credits=wallet.available_credits,
        )
    if payment.kind == "payg":
        provider_order = _provider_request(settings, "GET", f"/orders/{payment.provider_order_id}")
        fulfill_order(session, order=provider_order, payment_entity=provider_payment)
    else:
        provider_subscription = _provider_request(
            settings, "GET", f"/subscriptions/{payment.provider_subscription_id}"
        )
        fulfill_subscription_charge(
            session,
            subscription_entity=provider_subscription,
            payment_entity=provider_payment,
        )
    final_wallet = session.scalar(select(Wallet).where(Wallet.user_id == user_id))
    return ConfirmResponse(
        status="paid",
        available_credits=final_wallet.available_credits if final_wallet else 0,
    )


def verify_webhook_signature(raw_body: bytes, signature: str | None, settings: Settings) -> None:
    if not settings.razorpay_webhook_secret:
        raise BillingConfigurationError("Razorpay webhook secret is missing")
    expected = hmac.new(
        settings.razorpay_webhook_secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    if not signature or not hmac.compare_digest(expected, signature):
        raise BillingError("Invalid webhook signature")


def process_webhook(
    session: Session,
    *,
    event_id: str,
    payload: dict[str, Any],
) -> Literal["processed", "duplicate", "ignored"]:
    event_type = str(payload.get("event") or "")
    event = WebhookEvent(
        provider_event_id=event_id,
        event_type=event_type,
        payload=payload,
    )
    session.add(event)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        return "duplicate"

    raw_provider_payload = payload.get("payload")
    provider_payload: dict[str, Any] = (
        raw_provider_payload if isinstance(raw_provider_payload, dict) else {}
    )

    def entity(name: str) -> dict[str, Any]:
        container = provider_payload.get(name)
        if not isinstance(container, dict):
            return {}
        value = container.get("entity")
        return value if isinstance(value, dict) else {}

    order = entity("order")
    payment = entity("payment")
    subscription = entity("subscription")
    invoice = entity("invoice")
    result: Literal["processed", "ignored"] = "processed"
    try:
        if event_type == "order.paid":
            fulfill_order(session, order=order, payment_entity=payment)
        elif event_type == "subscription.charged":
            fulfill_subscription_charge(
                session,
                subscription_entity=subscription,
                payment_entity=payment,
                invoice_entity=invoice,
            )
        elif event_type in {
            "subscription.authenticated",
            "subscription.activated",
            "subscription.pending",
            "subscription.halted",
            "subscription.cancelled",
            "subscription.completed",
        }:
            update_subscription_status(session, subscription, event_type)
        elif event_type in {"payment.refunded", "refund.processed"}:
            refund_payment(session, payment)
        else:
            result = "ignored"
        event.status = result
        event.processed_at = datetime.now(UTC)
        session.add(event)
        session.commit()
        return result
    except Exception as exc:
        session.rollback()
        persisted = session.scalar(
            select(WebhookEvent).where(WebhookEvent.provider_event_id == event_id)
        )
        if persisted:
            persisted.status = "failed"
            persisted.error = str(exc)[:2000]
            persisted.processed_at = datetime.now(UTC)
            session.commit()
        raise


def billing_summary(session: Session, *, user_id: UUID) -> BillingSummary:
    wallet = _wallet_for_update(session, user_id)
    expire_credit_grants(session, user_id=user_id, wallet=wallet)
    subscription = session.scalar(
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    subscription_response = None
    if subscription:
        plan = session.get(Plan, subscription.plan_id)
        if plan:
            subscription_response = SubscriptionSummary(
                plan_code=plan.code,
                plan_name=plan.name,
                status=subscription.status,
                current_period_start=subscription.current_period_start,
                current_period_end=subscription.current_period_end,
                cancel_at_period_end=subscription.cancel_at_period_end,
            )
    grants = list(
        session.scalars(
            select(CreditGrant)
            .where(
                CreditGrant.user_id == user_id,
                (CreditGrant.available_credits > 0) | (CreditGrant.reserved_credits > 0),
            )
            .order_by(CreditGrant.expires_at)
        )
    )
    latest = session.scalar(
        select(BillingPayment)
        .where(BillingPayment.user_id == user_id)
        .order_by(BillingPayment.created_at.desc())
        .limit(1)
    )
    latest_response = None
    if latest:
        plan = session.get(Plan, latest.plan_id)
        if plan:
            latest_response = _payment_response(latest, plan)
    session.commit()
    return BillingSummary(
        available_credits=wallet.available_credits,
        reserved_credits=wallet.reserved_credits,
        lifetime_consumed_credits=wallet.lifetime_consumed_credits,
        subscription=subscription_response,
        credit_grants=[
            CreditGrantSummary(
                source_type=grant.source_type,
                available_credits=grant.available_credits,
                reserved_credits=grant.reserved_credits,
                expires_at=grant.expires_at,
            )
            for grant in grants
        ],
        latest_payment=latest_response,
    )


def payment_history(
    session: Session, *, user_id: UUID, limit: int, offset: int
) -> PaymentPage:
    rows = session.execute(
        select(BillingPayment, Plan)
        .join(Plan, Plan.id == BillingPayment.plan_id)
        .where(BillingPayment.user_id == user_id)
        .order_by(BillingPayment.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return PaymentPage(
        items=[_payment_response(payment, plan) for payment, plan in rows],
        limit=limit,
        offset=offset,
    )


def cancel_subscription(
    session: Session, *, user_id: UUID, settings: Settings
) -> CancelResponse:
    subscription = session.scalar(
        select(Subscription)
        .where(
            Subscription.user_id == user_id,
            Subscription.status.in_(["authenticated", "active", "pending", "halted"]),
        )
        .order_by(Subscription.created_at.desc())
        .limit(1)
        .with_for_update()
    )
    if subscription is None or not subscription.provider_subscription_id:
        raise BillingError("No cancellable subscription found")
    provider = _provider_request(
        settings,
        "POST",
        f"/subscriptions/{subscription.provider_subscription_id}/cancel",
        json={"cancel_at_cycle_end": True},
    )
    subscription.cancel_at_period_end = True
    subscription.status = str(provider.get("status") or subscription.status)
    subscription.current_period_end = (
        _timestamp(provider.get("current_end")) or subscription.current_period_end
    )
    session.commit()
    return CancelResponse(
        status=subscription.status,
        cancel_at_period_end=True,
        current_period_end=subscription.current_period_end,
    )
