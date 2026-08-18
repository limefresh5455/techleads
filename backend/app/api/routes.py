from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import hash_password, make_token, verify_password
from app.models import (
    BlogPost,
    Category,
    ContactMessage,
    DashboardPreview,
    DetectGroup,
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
)
from app.schemas import (
    AuthResponse,
    AuthUserOut,
    BlogPostOut,
    CategoryOut,
    ContactCreate,
    ContactOut,
    DashboardPreviewOut,
    DetectGroupOut,
    FeatureHighlightOut,
    FooterColumnOut,
    FreeToolOut,
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
