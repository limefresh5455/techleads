from concurrent.futures import ThreadPoolExecutor
from threading import Lock
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.auth import (
    CREDITS_PER_PAGE,
    CREDITS_PER_TECHNOLOGY_EXPORT,
    FREE_RECORD_LIMIT,
    MAX_EXPORT_ROWS,
    get_current_user,
    store_user_token,
)
from app.core.database import SessionLocal, get_db
from app.core.security import hash_password, make_token, verify_password
from app.models import (
    BlogPost,
    Category,
    ContactMessage,
    CustomDataBlock,
    DashboardPreview,
    DetectGroup,
    FaqItem,
    FeatureHighlight,
    FooterColumn,
    FreeTool,
    LegalLink,
    NavItem,
    PricingPlan,
    SiteContent,
    SocialLink,
    Technology,
    TrustLogo,
    User,
    OTP,
    Website,
    WebsiteTechnology,
)
from app.schemas import (
    AuthResponse,
    AuthUserOut,
    BlogPostOut,
    CategoryOut,
    ChangePasswordRequest,
    CheckoutConfirmOut,
    CheckoutRequest,
    CheckoutSessionOut,
    ContactCreate,
    ContactOut,
    CustomDataBlockOut,
    DashboardPreviewOut,
    DashboardExportOut,
    DashboardSearchOut,
    DashboardTechOut,
    DashboardWebsiteDetailOut,
    DashboardWebsiteOut,
    DetectGroupOut,
    DetectRequest,
    DetectResponse,
    EnrichRequest,
    FaqItemOut,
    FeatureHighlightOut,
    FooterColumnOut,
    FreeToolOut,
    FreeToolDetailOut,
    LandingPayload,
    LegalLinkOut,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    VerifyOTPResponse,
    NavItemOut,
    PricingPlanOut,
    SignupRequest,
    SiteContentOut,
    SocialLinkOut,
    TechnologyOut,
    TrustLogoOut,
    UpdateProfileRequest,
)
from app.services.detect_service import detect_and_store, refresh_website
from app.services.stripe_billing import (
    create_checkout_session,
    fulfill_checkout_session,
    handle_webhook_event,
)
from app.services.url_utils import slugify

router = APIRouter(prefix="/api")


def _feature_out(row: FeatureHighlight) -> FeatureHighlightOut:
    tags = [t.strip() for t in (row.tags or "").split(",") if t.strip()]
    return FeatureHighlightOut(
        id=row.id,
        title=row.title,
        description=row.description,
        icon=row.icon,
        link_label=row.link_label,
        variant=row.variant or "card",
        tags=tags,
    )


def _get_or_create_content(db: Session) -> SiteContent:
    content = db.query(SiteContent).first()
    if content:
        return content
    content = SiteContent()
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.get("/health")
def health():
    return {"status": "ok"}


_IMPORT_JOBS: dict[str, dict] = {}
_IMPORT_JOBS_LOCK = Lock()
_IMPORT_EXECUTOR = ThreadPoolExecutor(max_workers=1, thread_name_prefix="techleads-import")


def _set_import_job(job_id: str, **fields) -> None:
    with _IMPORT_JOBS_LOCK:
        row = _IMPORT_JOBS.setdefault(job_id, {"id": job_id})
        row.update(fields)


def _get_import_job(job_id: str) -> dict | None:
    with _IMPORT_JOBS_LOCK:
        row = _IMPORT_JOBS.get(job_id)
        return dict(row) if row else None


def _run_website_import_job(job_id: str, *, limit_techs: int, popular_only: bool, email: str) -> None:
    from app.services.import_techleads_websites import sync_websites_from_techleads

    _set_import_job(job_id, status="running", started_by=email)
    db = SessionLocal()
    try:
        stats = sync_websites_from_techleads(
            db,
            limit_techs=limit_techs,
            popular_only=popular_only,
            max_workers=4,
        )
        _set_import_job(job_id, status="done", result=stats)
    except Exception as exc:  # noqa: BLE001
        _set_import_job(job_id, status="failed", error=str(exc))
    finally:
        db.close()


@router.post("/technologies/import-techleads")
def import_techleads_technologies(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Fetch the public techleads.fyi catalog and upsert into the local DB."""
    from app.services.import_techleads_catalog import sync_technologies_from_techleads

    try:
        stats = sync_technologies_from_techleads(db)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Import failed: {exc}") from exc
    return {"ok": True, "imported_by": user.email, **stats}


@router.post("/websites/import-techleads")
def import_techleads_websites(
    limit_techs: int = Query(default=50, ge=1, le=5000),
    popular_only: bool = Query(default=False),
    user: User = Depends(get_current_user),
):
    """Start a background import of public sample websites from techleads.fyi.

    Scraping many technology pages exceeds Render's HTTP timeout, so this returns
    a job id immediately. Poll GET /api/websites/import-techleads/{job_id}.
    """
    job_id = uuid4().hex[:12]
    _set_import_job(
        job_id,
        status="queued",
        limit_techs=limit_techs,
        popular_only=popular_only,
        started_by=user.email,
    )
    _IMPORT_EXECUTOR.submit(
        _run_website_import_job,
        job_id,
        limit_techs=limit_techs,
        popular_only=popular_only,
        email=user.email,
    )
    return {
        "ok": True,
        "queued": True,
        "job_id": job_id,
        "status_url": f"/api/websites/import-techleads/{job_id}",
        "message": (
            "Import started in the background. Poll status_url until status is "
            "'done' or 'failed'. Large limit_techs can take many minutes."
        ),
        "limit_techs": limit_techs,
        "popular_only": popular_only,
    }


@router.get("/websites/import-techleads/{job_id}")
def import_techleads_websites_status(
    job_id: str,
    user: User = Depends(get_current_user),
):
    job = _get_import_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")
    return {"ok": True, **job}


@router.get("/landing", response_model=LandingPayload)
def get_landing(db: Session = Depends(get_db)):
    content = _get_or_create_content(db)
    nav_items = (
        db.query(NavItem)
        .options(joinedload(NavItem.children))
        .filter(NavItem.parent_id.is_(None))
        .order_by(NavItem.sort_order)
        .all()
    )
    for item in nav_items:
        item.children.sort(key=lambda child: child.sort_order)

    # Full catalog can be 30k+ rows — landing only needs featured/popular chips.
    technologies = (
        db.query(Technology)
        .order_by(Technology.sort_order.asc(), Technology.website_count.desc())
        .all()
    )
    popular_technologies = (
        db.query(Technology)
        .filter(Technology.is_popular.is_(True))
        .order_by(Technology.website_count.desc(), Technology.sort_order.asc())
        .all()
    )
    categories = db.query(Category).order_by(Category.sort_order).all()
    pricing_plans = (
        db.query(PricingPlan)
        .options(joinedload(PricingPlan.features))
        .order_by(PricingPlan.sort_order)
        .all()
    )
    for plan in pricing_plans:
        plan.features.sort(key=lambda f: f.sort_order)

    feature_highlights = [
        _feature_out(row)
        for row in db.query(FeatureHighlight).order_by(FeatureHighlight.sort_order).all()
    ]
    dashboard_previews = db.query(DashboardPreview).order_by(DashboardPreview.sort_order).all()
    detect_groups = (
        db.query(DetectGroup)
        .options(joinedload(DetectGroup.tags))
        .order_by(DetectGroup.sort_order)
        .all()
    )
    for group in detect_groups:
        group.tags.sort(key=lambda tag: tag.sort_order)

    trust_logos = db.query(TrustLogo).order_by(TrustLogo.sort_order).all()
    footer_columns = (
        db.query(FooterColumn)
        .options(joinedload(FooterColumn.links))
        .order_by(FooterColumn.sort_order)
        .all()
    )
    for col in footer_columns:
        col.links.sort(key=lambda link: link.sort_order)

    return LandingPayload(
        content=content,
        nav_items=nav_items,
        technologies=technologies,
        popular_technologies=popular_technologies,
        categories=categories,
        pricing_plans=pricing_plans,
        feature_highlights=feature_highlights,
        dashboard_previews=dashboard_previews,
        detect_groups=detect_groups,
        trust_logos=trust_logos,
        footer_columns=footer_columns,
        social_links=db.query(SocialLink).order_by(SocialLink.sort_order).all(),
        legal_links=db.query(LegalLink).order_by(LegalLink.sort_order).all(),
        free_tools=db.query(FreeTool).order_by(FreeTool.sort_order).all(),
        blog_posts=db.query(BlogPost).order_by(BlogPost.sort_order).all(),
        faqs=db.query(FaqItem).order_by(FaqItem.sort_order).all(),
        custom_data_blocks=db.query(CustomDataBlock).order_by(CustomDataBlock.sort_order).all(),
    )


@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        credits=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = make_token()
    store_user_token(db, user.id, token)
    db.commit()
    return AuthResponse(token=token, user=user)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if (user.password_hash or "").startswith("oauth:"):
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in. Please continue with Google.",
        )
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token()
    store_user_token(db, user.id, token)
    db.commit()
    db.refresh(user)
    return AuthResponse(token=token, user=user)


@router.post("/auth/send-otp")
async def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    from datetime import datetime, timedelta, timezone
    import secrets
    from app.services.email import send_otp_email
    
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    otp = str(secrets.randbelow(1000000)).zfill(6)
    
    # Store OTP
    otp_record = OTP(
        email=email,
        otp_hash=hash_password(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(otp_record)
    db.commit()
    
    # Send email
    try:
        await send_otp_email(email_to=email, otp=otp)
    except Exception as e:
        db.delete(otp_record)
        db.commit()
        print(f"Email Sending Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
        
    return {"message": "OTP sent successfully."}


@router.post("/auth/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    email = payload.email.lower().strip()
    
    otp_records = (
        db.query(OTP)
        .filter(OTP.email == email, OTP.is_verified == False)
        .all()
    )
    
    valid_record = None
    now = datetime.now(timezone.utc)
    for record in otp_records:
        if record.expires_at.tzinfo is None:
            # handle naive datetime from db if needed
            record.expires_at = record.expires_at.replace(tzinfo=timezone.utc)
            
        if record.expires_at > now:
            if verify_password(payload.otp, record.otp_hash):
                valid_record = record
                break
                
    if not valid_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
        
    valid_record.is_verified = True
    db.commit()
    return VerifyOTPResponse(message="OTP verified successfully.", verified=True)


@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    email = payload.email.lower().strip()

    otp_record = (
        db.query(OTP)
        .filter(
            OTP.email == email, 
            OTP.is_verified == True
        )
        .first()
    )
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="No verified OTP found. Please request a new one.")
        
    now = datetime.now(timezone.utc)
    if otp_record.expires_at.tzinfo is None:
        otp_record.expires_at = otp_record.expires_at.replace(tzinfo=timezone.utc)
        
    if otp_record.expires_at < now:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=400, detail="Reset session has expired. Please request a new OTP.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    user.password_hash = hash_password(payload.new_password)
    
    # Delete the OTP record (and any other OTPs for this email)
    db.query(OTP).filter(OTP.email == email).delete()
    db.commit()
    
    return {"message": "Password has been successfully reset."}


@router.get("/auth/google")
def google_auth_start(redirect: str = Query(default="/dashboard")):
    from urllib.parse import urlencode

    from app.core.config import settings as app_settings
    from app.services.google_auth import (
        build_google_authorize_url,
        google_oauth_configured,
        make_oauth_state,
    )

    if not google_oauth_configured():
        frontend = app_settings.frontend_url.rstrip("/")
        qs = urlencode(
            {
                "error": "Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env",
                "redirect": redirect if redirect.startswith("/") else "/dashboard",
            }
        )
        return RedirectResponse(url=f"{frontend}/auth/callback?{qs}", status_code=302)

    state = make_oauth_state(redirect)
    url = build_google_authorize_url(state=state)
    return RedirectResponse(url=url, status_code=302)


@router.get("/auth/google/callback")
def google_auth_callback(
    code: str = "",
    state: str = "",
    error: str = "",
    db: Session = Depends(get_db),
):
    from urllib.parse import urlencode

    from app.services.google_auth import (
        exchange_code_for_userinfo,
        parse_oauth_state,
        upsert_google_user,
    )
    from app.core.config import settings as app_settings

    frontend = app_settings.frontend_url.rstrip("/")
    redirect_path = parse_oauth_state(state)

    if error:
        qs = urlencode({"error": error, "redirect": redirect_path})
        return RedirectResponse(url=f"{frontend}/auth/callback?{qs}", status_code=302)
    if not code:
        qs = urlencode({"error": "missing_code", "redirect": redirect_path})
        return RedirectResponse(url=f"{frontend}/auth/callback?{qs}", status_code=302)

    try:
        profile = exchange_code_for_userinfo(code)
        user, token = upsert_google_user(db, profile)
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else "google_auth_failed"
        qs = urlencode({"error": detail, "redirect": redirect_path})
        return RedirectResponse(url=f"{frontend}/auth/callback?{qs}", status_code=302)
    except Exception as exc:
        qs = urlencode({"error": str(exc)[:200], "redirect": redirect_path})
        return RedirectResponse(url=f"{frontend}/auth/callback?{qs}", status_code=302)

    qs = urlencode(
        {
            "token": token,
            "redirect": redirect_path,
            "name": user.name,
            "email": user.email,
            "credits": str(user.credits or 0),
            "id": str(user.id),
        }
    )
    return RedirectResponse(url=f"{frontend}/auth/callback?{qs}", status_code=302)


@router.get("/me", response_model=AuthUserOut)
def get_me(user: User = Depends(get_current_user)):
    return _auth_user_out(user)


@router.patch("/me", response_model=AuthUserOut)
def update_me(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    user.name = payload.name.strip()
    db.commit()
    db.refresh(user)
    return _auth_user_out(user)


@router.post("/me/password", response_model=AuthUserOut)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if (user.password_hash or "").startswith("oauth:"):
        raise HTTPException(
            status_code=400,
            detail="Google accounts manage passwords through Google. Sign in with Google instead.",
        )
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="New password must be different")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    db.refresh(user)
    return _auth_user_out(user)


def _auth_user_out(user: User) -> AuthUserOut:
    provider = "google" if (user.password_hash or "").startswith("oauth:") else "email"
    return AuthUserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        credits=user.credits or 0,
        avatar_url=getattr(user, "avatar_url", None) or "",
        auth_provider=provider,
    )


@router.post("/billing/checkout", response_model=CheckoutSessionOut)
def billing_checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return create_checkout_session(
        db,
        user=user,
        plan_slug=payload.plan_slug,
        quantity=payload.quantity,
    )


@router.get("/billing/confirm", response_model=CheckoutConfirmOut)
def billing_confirm(
    session_id: str = Query(..., min_length=10),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models import CreditPurchase

    purchase = (
        db.query(CreditPurchase)
        .filter(CreditPurchase.stripe_session_id == session_id)
        .first()
    )
    if purchase and purchase.user_id != user.id:
        raise HTTPException(status_code=403, detail="This checkout session belongs to another account")

    result = fulfill_checkout_session(db, session_id)
    refreshed = db.query(User).filter(User.id == user.id).first()
    if refreshed:
        result["user_credits"] = refreshed.credits
    return result


@router.post("/billing/webhook")
async def billing_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    return handle_webhook_event(db, payload, signature)


@router.get("/content", response_model=SiteContentOut)
def get_content(db: Session = Depends(get_db)):
    return _get_or_create_content(db)


@router.get("/technologies", response_model=list[TechnologyOut])
def list_technologies(
    q: str = "",
    category: str = "",
    limit: int = Query(default=200, ge=1, le=2000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Technology)
    if q.strip():
        token = q.strip()
        query = query.filter(
            or_(
                Technology.name.ilike(f"%{token}%"),
                Technology.slug.ilike(f"%{token}%"),
            )
        )
    if category.strip() and category.strip() != "all":
        cat_slug = category.strip()
        cat = db.query(Category).filter(Category.slug == cat_slug).first()
        if cat:
            query = query.filter(Technology.category_id == cat.id)
            
    return (
        query.order_by(Technology.website_count.desc(), Technology.name.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/integrations/techleads/account")
def techleads_account_info(user: User = Depends(get_current_user)):
    """Show TechLeads.fyi API credit balance for the configured key."""
    from app.services.techleads_api import get_account_info

    try:
        info = get_account_info()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"TechLeads API error: {exc}") from exc
    return info


@router.post("/integrations/techleads/lookup")
def techleads_lookup(
    url: str = Query(..., min_length=3),
    user: User = Depends(get_current_user),
):
    """Run a TechLeads.fyi web lookup (1 credit) and return raw API payload."""
    from app.services.techleads_api import lookup_website

    try:
        return lookup_website(url)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"TechLeads lookup failed: {exc}") from exc


@router.get("/free-tools", response_model=list[FreeToolOut])
def list_free_tools(db: Session = Depends(get_db)):
    return db.query(FreeTool).order_by(FreeTool.sort_order).all()


@router.get("/free-tools/{slug}", response_model=FreeToolDetailOut)
def get_free_tool(slug: str, db: Session = Depends(get_db)):
    tool = (
        db.query(FreeTool)
        .options(
            joinedload(FreeTool.popular_items),
            joinedload(FreeTool.features),
            joinedload(FreeTool.faqs),
        )
        .filter(FreeTool.slug == slug)
        .first()
    )
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    tool.popular_items.sort(key=lambda x: x.sort_order)
    tool.features.sort(key=lambda x: x.sort_order)
    tool.faqs.sort(key=lambda x: x.sort_order)
    return tool


@router.get("/blog", response_model=list[BlogPostOut])
def list_blog(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.sort_order).all()


@router.get("/pricing", response_model=list[PricingPlanOut])
def list_pricing(db: Session = Depends(get_db)):
    plans = (
        db.query(PricingPlan)
        .options(joinedload(PricingPlan.features))
        .order_by(PricingPlan.sort_order)
        .all()
    )
    for plan in plans:
        plan.features.sort(key=lambda f: f.sort_order)
    return plans


@router.get("/nav", response_model=list[NavItemOut])
def list_nav(db: Session = Depends(get_db)):
    items = (
        db.query(NavItem)
        .options(joinedload(NavItem.children))
        .filter(NavItem.parent_id.is_(None))
        .order_by(NavItem.sort_order)
        .all()
    )
    for item in items:
        item.children.sort(key=lambda child: child.sort_order)
    return items


@router.post("/contact", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    row = ContactMessage(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        company_website=payload.company_website.strip(),
        message=payload.message.strip(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/technologies/search", response_model=list[TechnologyOut])
def search_technologies(q: str = "", db: Session = Depends(get_db)):
    query = db.query(Technology)
    if q.strip():
        token = q.strip()
        query = query.filter(
            or_(
                Technology.name.ilike(f"%{token}%"),
                Technology.slug.ilike(f"%{token}%"),
            )
        )
    return (
        query.order_by(Technology.website_count.desc(), Technology.name.asc())
        .limit(40)
        .all()
    )


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.sort_order).all()


@router.get("/dashboard/search", response_model=DashboardSearchOut)
def dashboard_search(
    q: str = "",
    technologies: str = "",
    match: str = Query(default="any", pattern="^(any|all)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tech_tokens = [slug.strip() for slug in technologies.split(",") if slug.strip()]
    filters_applied = len(tech_tokens) + (1 if q.strip() else 0)

    query = db.query(Website)
    if q.strip():
        query = query.filter(Website.domain.ilike(f"%{q.strip()}%"))

    query = _filter_websites_by_technologies(db, query, tech_tokens, match)

    total_filtered = query.count()
    db_total = db.query(Website).count()
    total_actual = max(db_total, 7_781_930) if db_total else 7_781_930

    # No technology selected → only first 10 records (free preview).
    # With technologies → browse all matches free; credits charged on export (1 / tech).
    if tech_tokens:
        accessible_records = total_filtered
    else:
        accessible_records = min(FREE_RECORD_LIMIT, total_filtered)

    viewable = accessible_records
    max_page = max(1, (viewable + page_size - 1) // page_size) if viewable else 1

    if page > max_page:
        if not tech_tokens:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Without a technology filter only the first {FREE_RECORD_LIMIT} records "
                    "are shown. Select a technology to browse and export more."
                ),
            )
        raise HTTPException(
            status_code=400,
            detail=f"Page {page} is out of range. Max page is {max_page}.",
        )

    rows = (
        query.options(
            joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
        )
        .order_by(Website.rank.asc(), Website.sort_order.asc())
        .offset((page - 1) * page_size)
        .limit(min(page_size, max(0, viewable - (page - 1) * page_size)))
        .all()
    )

    items = _website_rows_to_out(rows)

    return DashboardSearchOut(
        items=items,
        page=page,
        page_size=page_size,
        total_filtered=total_filtered,
        total_actual=total_actual,
        filters_applied=filters_applied,
        export_limit=MAX_EXPORT_ROWS,
        free_limit=FREE_RECORD_LIMIT,
        user_credits=user.credits,
        max_page=max_page,
        credits_per_page=CREDITS_PER_PAGE,
        accessible_records=accessible_records,
    )


def _filter_websites_by_technologies(db: Session, query, tech_tokens: list[str], match: str):
    """Filter by primary WebsiteTechnology links and/or All Detected (extra_technologies)."""
    if not tech_tokens:
        return query

    tech_rows = (
        db.query(Technology)
        .filter(
            or_(
                Technology.slug.in_(tech_tokens),
                Technology.slug.in_([slugify(t) for t in tech_tokens]),
                func.lower(Technology.name).in_([t.lower() for t in tech_tokens]),
            )
        )
        .all()
    )

    id_sets: list[set[int]] = []
    for token in tech_tokens:
        matched_ids: set[int] = set()
        row = next(
            (
                r
                for r in tech_rows
                if r.slug == token
                or r.slug == slugify(token)
                or r.name.lower() == token.lower()
            ),
            None,
        )
        if row:
            linked = {
                wid
                for (wid,) in db.query(WebsiteTechnology.website_id)
                .filter(WebsiteTechnology.technology_id == row.id)
                .all()
            }
            matched_ids |= linked
            name = row.name
        else:
            name = token

        # Also match sites where this tech appears in all-detected / extras text
        text_hits = {
            wid
            for (wid,) in db.query(Website.id)
            .filter(
                or_(
                    Website.extra_technologies.ilike(f"%{name}%"),
                    Website.cms_platform.ilike(f"%{name}%"),
                    Website.ecommerce_platform.ilike(f"%{name}%"),
                    Website.hosting_cdn.ilike(f"%{name}%"),
                    Website.marketing_stack.ilike(f"%{name}%"),
                    Website.analytics_tools.ilike(f"%{name}%"),
                    Website.payment_providers.ilike(f"%{name}%"),
                )
            )
            .all()
        }
        matched_ids |= text_hits
        id_sets.append(matched_ids)

    if not id_sets:
        return query.filter(Website.id == -1)

    if match == "all":
        final_ids = set.intersection(*id_sets) if id_sets else set()
    else:
        final_ids = set.union(*id_sets) if id_sets else set()

    if not final_ids:
        return query.filter(Website.id == -1)
    return query.filter(Website.id.in_(final_ids))


def _website_rows_to_out(rows: list[Website]) -> list[DashboardWebsiteOut]:
    items = []
    for row in rows:
        techs = sorted(
            [link.technology for link in row.technologies],
            key=lambda tech: tech.sort_order,
        )
        items.append(
            DashboardWebsiteOut(
                id=row.id,
                domain=row.domain,
                rank=row.rank,
                technologies=[
                    DashboardTechOut(
                        id=tech.id,
                        name=tech.name,
                        slug=tech.slug,
                        icon=tech.icon,
                        icon_color=tech.icon_color,
                    )
                    for tech in techs
                ],
            )
        )
    return items


@router.post("/dashboard/export", response_model=DashboardExportOut)
def dashboard_export(
    q: str = "",
    technologies: str = "",
    match: str = Query(default="any", pattern="^(any|all)$"),
    limit: int = Query(default=MAX_EXPORT_ROWS, ge=1, le=MAX_EXPORT_ROWS),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tech_tokens = [slug.strip() for slug in technologies.split(",") if slug.strip()]

    query = db.query(Website)
    if q.strip():
        query = query.filter(Website.domain.ilike(f"%{q.strip()}%"))

    query = _filter_websites_by_technologies(db, query, tech_tokens, match)

    if tech_tokens:
        # 1 credit per selected technology
        credits_used = len(tech_tokens) * CREDITS_PER_TECHNOLOGY_EXPORT
        export_limit = min(limit, MAX_EXPORT_ROWS)
        if user.credits < credits_used:
            raise HTTPException(
                status_code=402,
                detail=(
                    f"Need {credits_used} credit{'s' if credits_used != 1 else ''} to export "
                    f"{len(tech_tokens)} technolog{'ies' if len(tech_tokens) != 1 else 'y'}. "
                    f"You have {user.credits}."
                ),
            )
    else:
        # No technology selected → free export of first 10 records only
        credits_used = 0
        export_limit = min(limit, FREE_RECORD_LIMIT)

    if credits_used:
        user.credits -= credits_used
        db.commit()
        db.refresh(user)

    rows = (
        query.options(
            joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
        )
        .order_by(Website.rank.asc(), Website.sort_order.asc())
        .limit(export_limit)
        .all()
    )

    return DashboardExportOut(
        rows=[_website_detail_out(row) for row in rows],
        exported_count=len(rows),
        credits_used=credits_used,
        user_credits=user.credits,
        free_limit=FREE_RECORD_LIMIT,
    )


def _split_stored_list(value: str | None, *, sep: str | None = None) -> list[str]:
    raw = (value or "").strip()
    if not raw:
        return []
    if sep:
        return [part.strip() for part in raw.split(sep) if part.strip()]
    if "\n" in raw:
        return [part.strip() for part in raw.split("\n") if part.strip()]
    if " | " in raw:
        return [part.strip() for part in raw.split(" | ") if part.strip()]
    return [part.strip() for part in raw.split(",") if part.strip()]


def _website_detail_out(row: Website) -> DashboardWebsiteDetailOut:
    import json

    techs = sorted(
        [link.technology for link in row.technologies],
        key=lambda tech: tech.sort_order,
    )
    primary = [t.name for t in techs]
    extra = [t.strip() for t in (row.extra_technologies or "").split(",") if t.strip()]
    all_detected = primary + [t for t in extra if t not in primary]
    enriched = json.loads(row.enriched_json or "{}") if row.enriched_json else {}

    marketing = _split_stored_list(row.marketing_stack) or enriched.get("marketing_stack") or []
    analytics = _split_stored_list(row.analytics_tools) or enriched.get("analytics_tools") or []
    payments = _split_stored_list(row.payment_providers) or enriched.get("payment_providers") or []
    features = _split_stored_list(row.key_features, sep=" | ") or enriched.get("key_features") or []
    insights = _split_stored_list(row.llm_insights, sep="\n") or enriched.get("llm_insights") or []

    return DashboardWebsiteDetailOut(
        id=row.id,
        domain=row.domain,
        title=row.title or row.domain,
        description=row.description or enriched.get("description", ""),
        category_label=row.category_label or enriched.get("category_label", "Uncategorized"),
        subcategory=str(getattr(row, "subcategory", None) or enriched.get("subcategory") or ""),
        contact_info=row.contact_info or enriched.get("contact_info", "No contact information available"),
        rank=row.rank,
        technologies=[
            DashboardTechOut(
                id=tech.id,
                name=tech.name,
                slug=tech.slug,
                icon=tech.icon,
                icon_color=tech.icon_color,
            )
            for tech in techs
        ],
        all_detected_technologies=all_detected,
        facebook_url=row.facebook_url or enriched.get("facebook_url", ""),
        twitter_url=row.twitter_url or enriched.get("twitter_url", ""),
        linkedin_url=row.linkedin_url or enriched.get("linkedin_url", ""),
        last_crawled_at=row.last_crawled_at.isoformat() if row.last_crawled_at else None,
        source_url=row.source_url or "",
        enriched=enriched,
        llm_used=bool(row.llm_used if row.llm_used is not None else enriched.get("llm_used")),
        llm_error=str(row.llm_error or enriched.get("llm_error") or ""),
        llm_provider=str(row.llm_provider or enriched.get("llm_provider") or ""),
        llm_model=str(row.llm_model or enriched.get("llm_model") or ""),
        industry=str(row.industry or enriched.get("industry") or ""),
        company_type=str(row.company_type or enriched.get("company_type") or ""),
        business_summary=str(row.business_summary or enriched.get("business_summary") or ""),
        marketing_stack=marketing,
        analytics_tools=analytics,
        payment_providers=payments,
        cms_platform=str(row.cms_platform or enriched.get("cms_platform") or ""),
        ecommerce_platform=str(row.ecommerce_platform or enriched.get("ecommerce_platform") or ""),
        hosting_cdn=str(row.hosting_cdn or enriched.get("hosting_cdn") or ""),
        key_features=features,
        target_audience=str(row.target_audience or enriched.get("target_audience") or ""),
        phone=str(row.phone or enriched.get("phone") or ""),
        address=str(row.address or enriched.get("address") or ""),
        instagram_url=str(row.instagram_url or enriched.get("instagram_url") or ""),
        youtube_url=str(row.youtube_url or enriched.get("youtube_url") or ""),
        estimated_traffic_tier=str(row.estimated_traffic_tier or enriched.get("estimated_traffic_tier") or ""),
        confidence_score=int(row.confidence_score or enriched.get("confidence_score") or 0),
        llm_insights=insights,
    )


def _detect_response(website: Website) -> DetectResponse:
    import json

    signals = json.loads(website.signals_json or "{}")
    enriched = json.loads(website.enriched_json or "{}")
    crawl_ms = getattr(website, "_crawl_ms", 0)
    return DetectResponse(
        website=_website_detail_out(website),
        signals=signals,
        enriched=enriched,
        crawl_ms=crawl_ms,
    )


@router.post("/detect", response_model=DetectResponse)
@router.post("/v1/detect", response_model=DetectResponse)
def detect_website(payload: DetectRequest, db: Session = Depends(get_db)):
    try:
        website = detect_and_store(db, payload.url)
        website = (
            db.query(Website)
            .options(
                joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
            )
            .filter(Website.id == website.id)
            .first()
        )
        return _detect_response(website)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Detection failed: {exc}") from exc


@router.post("/v1/enrich", response_model=list[DetectResponse])
def enrich_websites(payload: EnrichRequest, db: Session = Depends(get_db)):
    results: list[DetectResponse] = []
    for raw_url in payload.urls[:50]:
        try:
            website = detect_and_store(db, raw_url)
            website = (
                db.query(Website)
                .options(
                    joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
                )
                .filter(Website.id == website.id)
                .first()
            )
            results.append(_detect_response(website))
        except Exception:
            continue
    if not results:
        raise HTTPException(status_code=400, detail="No URLs could be enriched")
    return results


@router.get("/dashboard/websites/{website_id}", response_model=DashboardWebsiteDetailOut)
def get_dashboard_website(
    website_id: int,
    refresh: bool = Query(False),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Website)
        .options(
            joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
        )
        .filter(Website.id == website_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Website not found")

    if refresh:
        try:
            # Explicit Re-enrich / Analyze — use TechLeads.fyi API (1 credit)
            row = refresh_website(db, row, use_techleads_api=True)
            row = (
                db.query(Website)
                .options(
                    joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
                )
                .filter(Website.id == website_id)
                .first()
            )
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"AI enrichment failed: {exc}") from exc

    return _website_detail_out(row)
