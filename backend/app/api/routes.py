from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.auth import (
    CREDITS_PER_PAGE,
    FREE_RECORD_LIMIT,
    get_current_user,
    store_user_token,
)
from app.core.database import get_db
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
    Website,
    WebsiteTechnology,
)
from app.schemas import (
    AuthResponse,
    AuthUserOut,
    BlogPostOut,
    CategoryOut,
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
    NavItemOut,
    PricingPlanOut,
    SignupRequest,
    SiteContentOut,
    SocialLinkOut,
    TechnologyOut,
    TrustLogoOut,
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

    technologies = db.query(Technology).order_by(Technology.sort_order).all()
    popular_technologies = (
        db.query(Technology)
        .filter(Technology.is_popular.is_(True))
        .order_by(Technology.sort_order)
        .limit(10)
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
    return user


@router.post("/billing/checkout", response_model=CheckoutSessionOut)
def billing_checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return create_checkout_session(db, user=user, plan_slug=payload.plan_slug)


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
def list_technologies(db: Session = Depends(get_db)):
    return db.query(Technology).order_by(Technology.sort_order).all()


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
        query = query.filter(Technology.name.ilike(f"%{q.strip()}%"))
    return query.order_by(Technology.website_count.desc()).limit(20).all()


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

    accessible_records = FREE_RECORD_LIMIT + max(user.credits, 0)
    viewable = min(accessible_records, total_filtered)
    max_page = max(1, (viewable + page_size - 1) // page_size)

    if page > max_page:
        needed = CREDITS_PER_PAGE
        raise HTTPException(
            status_code=402,
            detail=f"Need {needed} credits to view more than {FREE_RECORD_LIMIT} results. Buy credits on Pricing.",
        )

    if page > 1:
        if user.credits < CREDITS_PER_PAGE:
            raise HTTPException(
                status_code=402,
                detail=f"Need {CREDITS_PER_PAGE} credits to view page {page}.",
            )
        user.credits -= CREDITS_PER_PAGE
        db.commit()
        db.refresh(user)

    rows = (
        query.options(
            joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
        )
        .order_by(Website.rank.asc(), Website.sort_order.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
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
        export_limit=FREE_RECORD_LIMIT,
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
    limit: int = Query(default=10, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tech_tokens = [slug.strip() for slug in technologies.split(",") if slug.strip()]

    query = db.query(Website)
    if q.strip():
        query = query.filter(Website.domain.ilike(f"%{q.strip()}%"))

    query = _filter_websites_by_technologies(db, query, tech_tokens, match)

    max_export = FREE_RECORD_LIMIT + max(user.credits, 0)
    if limit > max_export:
        extra = limit - FREE_RECORD_LIMIT
        raise HTTPException(
            status_code=402,
            detail=f"Need {extra} credits to export {limit} records. You have {user.credits} credits.",
        )

    credits_used = max(0, limit - FREE_RECORD_LIMIT)
    if credits_used > user.credits:
        raise HTTPException(
            status_code=402,
            detail=f"Need {credits_used} credits to export {limit} records.",
        )

    user.credits -= credits_used
    db.commit()
    db.refresh(user)

    rows = (
        query.options(
            joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
        )
        .order_by(Website.rank.asc(), Website.sort_order.asc())
        .limit(limit)
        .all()
    )

    return DashboardExportOut(
        rows=_website_rows_to_out(rows),
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
            row = refresh_website(db, row)
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
