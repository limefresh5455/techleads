"""Stripe Checkout helpers for one-time credit pack purchases."""

from __future__ import annotations

from datetime import datetime, timezone

import stripe
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import CreditPurchase, PricingPlan, User


def _configure_stripe():
    if not settings.stripe_secret_key.strip():
        raise HTTPException(
            status_code=503,
            detail="Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env",
        )
    stripe.api_key = settings.stripe_secret_key.strip()


def create_checkout_session(
    db: Session,
    *,
    user: User,
    plan_slug: str,
    quantity: int = 1,
) -> dict:
    plan = db.query(PricingPlan).filter(PricingPlan.slug == plan_slug).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Pricing plan not found")
    if plan.slug == "enterprise" or plan.monthly_price <= 0 or plan.credits <= 0:
        raise HTTPException(status_code=400, detail="This plan is not available for self-serve purchase")

    qty = max(1, min(int(quantity or 1), 100))
    # Only Bulk Purchase supports multi-technology quantity (1 credit each).
    if plan.slug != "bulk":
        qty = 1
    elif qty not in {1, 5, 10, 25, 100}:
        raise HTTPException(
            status_code=400,
            detail="Bulk quantity must be one of: 1, 5, 10, 25, 100",
        )

    _configure_stripe()
    unit_cents = int(plan.monthly_price) * 100
    amount_cents = unit_cents * qty
    credits = int(plan.credits) * qty
    frontend = settings.frontend_url.rstrip("/")

    product_name = (
        f"{plan.name} — {qty} technolog{'y' if qty == 1 else 'ies'}"
        if plan.slug == "bulk"
        else f"{plan.name} — {credits:,} credits"
    )
    product_desc = (
        f"{qty} technology export credit{'s' if qty != 1 else ''} · $29 each"
        if plan.slug == "bulk"
        else (plan.description or f"{credits:,} TechLeads.Ai credits")
    )

    session = stripe.checkout.Session.create(
        mode="payment",
        customer_email=user.email,
        line_items=[
            {
                "quantity": qty,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": unit_cents,
                    "product_data": {
                        "name": product_name,
                        "description": product_desc,
                    },
                },
            }
        ],
        success_url=f"{frontend}/pricing?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend}/pricing?checkout=cancel",
        metadata={
            "user_id": str(user.id),
            "plan_slug": plan.slug,
            "credits": str(credits),
            "quantity": str(qty),
        },
        payment_intent_data={
            "metadata": {
                "user_id": str(user.id),
                "plan_slug": plan.slug,
                "credits": str(credits),
                "quantity": str(qty),
            }
        },
    )

    purchase = CreditPurchase(
        user_id=user.id,
        plan_slug=plan.slug,
        credits=credits,
        amount_cents=amount_cents,
        currency="usd",
        stripe_session_id=session.id,
        status="pending",
    )
    db.add(purchase)
    db.commit()

    return {
        "checkout_url": session.url,
        "session_id": session.id,
        "publishable_key": settings.stripe_publishable_key,
    }


def _meta_value(meta, key: str, default: str = "") -> str:
    if meta is None:
        return default
    if isinstance(meta, dict):
        return str(meta.get(key) or default)
    try:
        value = meta[key]
    except Exception:
        value = getattr(meta, key, None)
    return str(value or default)


def fulfill_checkout_session(db: Session, session_id: str) -> dict:
    """Idempotently grant credits after a successful Checkout session."""
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    purchase = (
        db.query(CreditPurchase)
        .filter(CreditPurchase.stripe_session_id == session_id)
        .first()
    )

    _configure_stripe()
    session = stripe.checkout.Session.retrieve(session_id)

    if session.payment_status not in {"paid", "no_payment_required"}:
        raise HTTPException(status_code=400, detail=f"Payment not completed ({session.payment_status})")

    if purchase and purchase.status == "paid":
        user = db.query(User).filter(User.id == purchase.user_id).first()
        return {
            "status": "already_paid",
            "credits_added": 0,
            "user_credits": user.credits if user else 0,
            "plan_slug": purchase.plan_slug,
        }

    meta = getattr(session, "metadata", None)
    user_id = int(_meta_value(meta, "user_id", "0") or 0)
    credits = int(_meta_value(meta, "credits", "0") or 0)
    plan_slug = _meta_value(meta, "plan_slug", "")
    payment_intent = ""
    if getattr(session, "payment_intent", None):
        payment_intent = str(session.payment_intent)

    if not purchase:
        if not user_id or credits <= 0:
            raise HTTPException(status_code=400, detail="Missing purchase metadata")
        purchase = CreditPurchase(
            user_id=user_id,
            plan_slug=plan_slug or "unknown",
            credits=credits,
            amount_cents=int(getattr(session, "amount_total", 0) or 0),
            currency=str(getattr(session, "currency", None) or "usd"),
            stripe_session_id=session_id,
            status="pending",
        )
        db.add(purchase)
        db.flush()

    user = db.query(User).filter(User.id == purchase.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found for purchase")

    user.credits = int(user.credits or 0) + int(purchase.credits)
    purchase.status = "paid"
    purchase.stripe_payment_intent = payment_intent
    purchase.paid_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    return {
        "status": "paid",
        "credits_added": purchase.credits,
        "user_credits": user.credits,
        "plan_slug": purchase.plan_slug,
    }


def handle_webhook_event(db: Session, payload: bytes, signature: str) -> dict:
    _configure_stripe()
    secret = settings.stripe_webhook_secret.strip()
    if not secret:
        raise HTTPException(status_code=503, detail="STRIPE_WEBHOOK_SECRET not configured")

    try:
        event = stripe.Webhook.construct_event(payload, signature, secret)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid webhook signature: {exc}") from exc

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        session_id = ""
        if isinstance(session_obj, dict):
            session_id = str(session_obj.get("id") or "")
        else:
            session_id = str(getattr(session_obj, "id", "") or "")
        if session_id:
            return fulfill_checkout_session(db, session_id)

    event_type = event["type"] if isinstance(event, dict) else getattr(event, "type", "unknown")
    return {"status": "ignored", "type": event_type}