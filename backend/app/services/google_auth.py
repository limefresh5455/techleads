"""Google OAuth 2.0 login / signup helpers."""

from __future__ import annotations

import secrets
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import make_token
from app.core.auth import store_user_token
from app.models import User

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
OAUTH_PASSWORD_MARKER = "oauth:google"


def _google_settings() -> Settings:
    return Settings()


def google_oauth_configured() -> bool:
    s = _google_settings()
    return bool(s.google_client_id.strip() and s.google_client_secret.strip())


def _require_google_config() -> None:
    if not google_oauth_configured():
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env",
        )


def build_google_authorize_url(*, state: str) -> str:
    _require_google_config()
    s = _google_settings()
    params = {
        "client_id": s.google_client_id.strip(),
        "redirect_uri": s.google_redirect_uri.strip(),
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "include_granted_scopes": "true",
        "prompt": "select_account",
        "state": state,
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def make_oauth_state(redirect_path: str = "/dashboard") -> str:
    nonce = secrets.token_urlsafe(16)
    safe = (redirect_path or "/dashboard").strip() or "/dashboard"
    if not safe.startswith("/"):
        safe = "/dashboard"
    return f"{safe}|{nonce}"


def parse_oauth_state(state: str) -> str:
    if not state or "|" not in state:
        return "/dashboard"
    path = state.split("|", 1)[0].strip() or "/dashboard"
    if not path.startswith("/") or path.startswith("//"):
        return "/dashboard"
    return path


def exchange_code_for_userinfo(code: str) -> dict:
    _require_google_config()
    s = _google_settings()
    with httpx.Client(timeout=20.0) as client:
        token_res = client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": s.google_client_id.strip(),
                "client_secret": s.google_client_secret.strip(),
                "redirect_uri": s.google_redirect_uri.strip(),
                "grant_type": "authorization_code",
            },
        )
        if token_res.status_code >= 400:
            raise HTTPException(
                status_code=400,
                detail=f"Google token exchange failed: {token_res.text[:300]}",
            )
        tokens = token_res.json()
        access_token = tokens.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Google did not return an access token")

        info_res = client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if info_res.status_code >= 400:
            raise HTTPException(
                status_code=400,
                detail=f"Google userinfo failed: {info_res.text[:300]}",
            )
        info = info_res.json()

    email = str(info.get("email") or "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")
    if info.get("email_verified") is False:
        raise HTTPException(status_code=400, detail="Google email is not verified")

    return {
        "email": email,
        "name": str(info.get("name") or info.get("given_name") or email.split("@")[0]).strip()[:160],
        "google_sub": str(info.get("sub") or "")[:255],
        "picture": str(info.get("picture") or "")[:500],
    }


def upsert_google_user(db: Session, profile: dict) -> tuple[User, str]:
    email = profile["email"]
    google_sub = profile.get("google_sub") or ""
    user = None
    if google_sub:
        user = db.query(User).filter(User.google_sub == google_sub).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        if google_sub and not user.google_sub:
            user.google_sub = google_sub
        if profile.get("name") and (not user.name or user.name == email.split("@")[0]):
            user.name = profile["name"]
        if profile.get("picture") and not user.avatar_url:
            user.avatar_url = profile["picture"]
        # Keep existing password_hash if they registered with email
        if not user.password_hash:
            user.password_hash = OAUTH_PASSWORD_MARKER
    else:
        user = User(
            name=profile["name"],
            email=email,
            password_hash=OAUTH_PASSWORD_MARKER,
            google_sub=google_sub,
            avatar_url=str(profile.get("picture") or "")[:500],
            credits=0,
        )
        db.add(user)

    db.flush()
    token = make_token()
    store_user_token(db, user.id, token)
    db.commit()
    db.refresh(user)
    return user, token
