from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

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
    BlogPostOut,
    CategoryOut,
    ContactCreate,
    ContactOut,
    CustomDataBlockOut,
    DashboardPreviewOut,
    DashboardSearchOut,
    DashboardTechOut,
    DashboardWebsiteDetailOut,
    DashboardWebsiteOut,
    DetectGroupOut,
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
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(token=make_token(), user=user)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return AuthResponse(token=make_token(), user=user)


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
):
    tech_slugs = [slug.strip() for slug in technologies.split(",") if slug.strip()]
    filters_applied = len(tech_slugs) + (1 if q.strip() else 0)

    query = db.query(Website)
    if q.strip():
        query = query.filter(Website.domain.ilike(f"%{q.strip()}%"))

    if tech_slugs:
        tech_rows = db.query(Technology).filter(Technology.slug.in_(tech_slugs)).all()
        tech_ids = [row.id for row in tech_rows]
        if tech_ids:
            if match == "all":
                query = (
                    query.join(WebsiteTechnology)
                    .filter(WebsiteTechnology.technology_id.in_(tech_ids))
                    .group_by(Website.id)
                    .having(
                        func.count(WebsiteTechnology.technology_id.distinct()) == len(tech_ids)
                    )
                )
            else:
                query = query.filter(
                    Website.id.in_(
                        db.query(WebsiteTechnology.website_id).filter(
                            WebsiteTechnology.technology_id.in_(tech_ids)
                        )
                    )
                )
        else:
            query = query.filter(Website.id == -1)

    total_filtered = query.count()
    total_actual = 7_781_930
    export_limit = 10

    rows = (
        query.options(
            joinedload(Website.technologies).joinedload(WebsiteTechnology.technology)
        )
        .order_by(Website.rank.asc(), Website.sort_order.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

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

    return DashboardSearchOut(
        items=items,
        page=page,
        page_size=page_size,
        total_filtered=total_filtered,
        total_actual=total_actual,
        filters_applied=filters_applied,
        export_limit=export_limit,
    )


def _website_detail_out(row: Website) -> DashboardWebsiteDetailOut:
    techs = sorted(
        [link.technology for link in row.technologies],
        key=lambda tech: tech.sort_order,
    )
    primary = [t.name for t in techs]
    extra = [t.strip() for t in (row.extra_technologies or "").split(",") if t.strip()]
    all_detected = primary + [t for t in extra if t not in primary]

    return DashboardWebsiteDetailOut(
        id=row.id,
        domain=row.domain,
        title=row.title or row.domain,
        description=row.description or "",
        category_label=row.category_label or "Uncategorized",
        contact_info=row.contact_info or "No contact information available",
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
        facebook_url=row.facebook_url or "",
        twitter_url=row.twitter_url or "",
        linkedin_url=row.linkedin_url or "",
    )


@router.get("/dashboard/websites/{website_id}", response_model=DashboardWebsiteDetailOut)
def get_dashboard_website(website_id: int, db: Session = Depends(get_db)):
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
    return _website_detail_out(row)
