from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models import (
    User, SiteContent, NavItem, Technology, Category, PricingPlan, PlanFeature,
    FeatureHighlight, DashboardPreview, DetectGroup, DetectTag,
    FooterColumn, FooterLink, SocialLink, LegalLink, BlogPost, FaqItem, CustomDataBlock, ContactMessage,
    Website, WebsiteTechnology, CreditPurchase
)
from datetime import datetime, timedelta
from app.schemas import (
    SiteContentOut, SiteContentUpdate,
    NavItemOut, NavItemCreate, NavItemUpdate,
    CategoryOut, CategoryCreate, CategoryUpdate,
    TechnologyOut, TechnologyCreate, TechnologyUpdate,
    PricingPlanOut, PricingPlanCreate, PricingPlanUpdate,
    FeatureHighlightOut, FeatureHighlightCreate, FeatureHighlightUpdate,
    DashboardPreviewOut, DashboardPreviewCreate, DashboardPreviewUpdate,
    DetectGroupOut, DetectGroupCreate, DetectGroupUpdate,
    FooterColumnOut, FooterColumnCreate, FooterColumnUpdate,
    SocialLinkOut, SocialLinkCreate, SocialLinkUpdate,
    LegalLinkOut, LegalLinkCreate, LegalLinkUpdate,
    BlogPostOut, BlogPostCreate, BlogPostUpdate,
    FaqItemOut, FaqItemCreate, FaqItemUpdate,
    CustomDataBlockOut, CustomDataBlockCreate, CustomDataBlockUpdate,
    WebsiteAdminOut, WebsiteCreate, WebsiteUpdate,
    PaginatedCategoryOut, PaginatedTechnologyOut, PaginatedWebsiteOut,
    AdminDashboardFullOut
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_current_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user

@router.get("/dashboard-stats", response_model=AdminDashboardFullOut)
def get_dashboard_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_customers = db.query(func.count(User.id)).filter(User.role == "customer").scalar() or 0
    total_admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0
    total_websites = db.query(func.count(Website.id)).scalar() or 0
    total_technologies = db.query(func.count(Technology.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_messages = db.query(func.count(ContactMessage.id)).scalar() or 0

    total_revenue = db.query(func.sum(CreditPurchase.amount_cents)).filter(CreditPurchase.status == "paid").scalar() or 0
    active_plans = db.query(func.count(func.distinct(CreditPurchase.user_id))).filter(CreditPurchase.status == "paid").scalar() or 0

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_signups = [
        {"name": u.name, "email": u.email, "role": u.role, "created_at": u.created_at.isoformat() if u.created_at else ""}
        for u in recent_users
    ]

    recent_contact_messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(5).all()
    recent_messages = [
        {"name": m.name, "email": m.email, "message": m.message, "created_at": m.created_at.isoformat() if m.created_at else ""}
        for m in recent_contact_messages
    ]

    # Revenue Graph (last 30 days including today)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = today - timedelta(days=29) # Total 30 days including today
    
    # Simple query fetching recent purchases and grouping in Python
    purchases = db.query(CreditPurchase).filter(
        CreditPurchase.status == "paid",
        CreditPurchase.created_at >= thirty_days_ago
    ).all()

    from collections import defaultdict
    revenue_by_date = defaultdict(int)
    for p in purchases:
        if p.created_at:
            date_str = p.created_at.strftime("%Y-%m-%d")
            revenue_by_date[date_str] += p.amount_cents

    # Generate complete last 30 days list
    revenue_graph = []
    for i in range(30):
        d = thirty_days_ago + timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        revenue_graph.append({
            "date": date_str,
            "revenue": revenue_by_date.get(date_str, 0)
        })

    # Plan Distribution (total sales per plan)
    plan_distribution = []
    plan_stats = db.query(CreditPurchase.plan_slug, func.count(CreditPurchase.id))\
        .filter(CreditPurchase.status == "paid")\
        .group_by(CreditPurchase.plan_slug).all()
        
    for plan_slug, count in plan_stats:
        plan_distribution.append({
            "name": plan_slug.capitalize(),
            "value": count
        })

    return {
        "total_users": total_users,
        "total_customers": total_customers,
        "total_admins": total_admins,
        "total_websites": total_websites,
        "total_technologies": total_technologies,
        "total_categories": total_categories,
        "total_messages": total_messages,
        "total_revenue": total_revenue,
        "active_plans": active_plans,
        "recent_signups": recent_signups,
        "recent_messages": recent_messages,
        "revenue_graph": revenue_graph,
        "plan_distribution": plan_distribution
    }

# Helper for CRUD
def get_or_404(db, model, item_id):
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return item

# --- Site Content ---
@router.get("/site-content", response_model=SiteContentOut)
def get_site_content(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    content = db.query(SiteContent).first()
    if not content:
        content = SiteContent()
        db.add(content)
        db.commit()
        db.refresh(content)
    return content

@router.put("/site-content", response_model=SiteContentOut)
def update_site_content(data: SiteContentUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    content = db.query(SiteContent).first()
    if not content:
        content = SiteContent()
        db.add(content)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(content, k, v)
    db.commit()
    db.refresh(content)
    return content

# --- FAQs ---
@router.get("/faqs", response_model=List[FaqItemOut])
def get_faqs(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(FaqItem).order_by(FaqItem.sort_order).all()

@router.post("/faqs", response_model=FaqItemOut)
def create_faq(data: FaqItemCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = FaqItem(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(FaqItem.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/faqs/{item_id}", response_model=FaqItemOut)
def update_faq(item_id: int, data: FaqItemUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, FaqItem, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/faqs/{item_id}")
def delete_faq(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, FaqItem, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- Blog Posts ---
@router.get("/blog-posts", response_model=List[BlogPostOut])
def get_blogs(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(BlogPost).order_by(BlogPost.sort_order).all()

@router.post("/blog-posts", response_model=BlogPostOut)
def create_blog(data: BlogPostCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = BlogPost(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(BlogPost.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/blog-posts/{item_id}", response_model=BlogPostOut)
def update_blog(item_id: int, data: BlogPostUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, BlogPost, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/blog-posts/{item_id}")
def delete_blog(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, BlogPost, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- Social Links ---
@router.get("/social-links", response_model=List[SocialLinkOut])
def get_social_links(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(SocialLink).order_by(SocialLink.sort_order).all()

@router.post("/social-links", response_model=SocialLinkOut)
def create_social_link(data: SocialLinkCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = SocialLink(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(SocialLink.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/social-links/{item_id}", response_model=SocialLinkOut)
def update_social_link(item_id: int, data: SocialLinkUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, SocialLink, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/social-links/{item_id}")
def delete_social_link(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, SocialLink, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- Legal Links ---
@router.get("/legal-links", response_model=List[LegalLinkOut])
def get_legal_links(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(LegalLink).order_by(LegalLink.sort_order).all()

@router.post("/legal-links", response_model=LegalLinkOut)
def create_legal_link(data: LegalLinkCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = LegalLink(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(LegalLink.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/legal-links/{item_id}", response_model=LegalLinkOut)
def update_legal_link(item_id: int, data: LegalLinkUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, LegalLink, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/legal-links/{item_id}")
def delete_legal_link(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, LegalLink, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- Category ---
@router.get("/categories", response_model=PaginatedCategoryOut)
def get_categories(
    page: int = 1, 
    limit: int = 20, 
    search: str = "", 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin_user)
):
    query = db.query(Category)
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(Category.sort_order).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.post("/categories", response_model=CategoryOut)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = Category(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(Category.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/categories/{item_id}", response_model=CategoryOut)
def update_category(item_id: int, data: CategoryUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, Category, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None: setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/categories/{item_id}")
def delete_category(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, Category, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

@router.get("/technologies", response_model=PaginatedTechnologyOut)
def get_technologies(
    page: int = 1, 
    limit: int = 20, 
    search: str = "", 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin_user)
):
    query = db.query(Technology)
    if search:
        query = query.filter(Technology.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(Technology.sort_order).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.post("/technologies", response_model=TechnologyOut)
def create_technology(data: TechnologyCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = Technology(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(Technology.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/technologies/{item_id}", response_model=TechnologyOut)
def update_technology(item_id: int, data: TechnologyUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, Technology, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None: setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/technologies/{item_id}")
def delete_technology(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, Technology, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- PricingPlan ---
@router.get("/pricing-plans", response_model=List[PricingPlanOut])
def get_pricing_plans(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(PricingPlan).order_by(PricingPlan.sort_order).all()

@router.post("/pricing-plans", response_model=PricingPlanOut)
def create_pricing_plan(data: PricingPlanCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    data_dict = data.dict(exclude={"features"})
    item = PricingPlan(**data_dict)
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(PricingPlan.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    
    db.add(item)
    
    if data.features:
        for i, f_data in enumerate(data.features):
            f_dict = f_data.dict(exclude={"sort_order"})
            item.features.append(PlanFeature(**f_dict, sort_order=i))
            
    db.commit()
    db.refresh(item)
    return item

@router.put("/pricing-plans/{item_id}", response_model=PricingPlanOut)
def update_pricing_plan(item_id: int, data: PricingPlanUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, PricingPlan, item_id)
    data_dict = data.dict(exclude={"features"}, exclude_unset=True)
    for k, v in data_dict.items():
        if v is not None: setattr(item, k, v)
        
    if data.features is not None:
        item.features = [] # clear existing
        for i, f_data in enumerate(data.features):
            f_dict = f_data.dict(exclude={"sort_order"})
            item.features.append(PlanFeature(**f_dict, sort_order=i))
            
    db.commit()
    db.refresh(item)
    return item

@router.delete("/pricing-plans/{item_id}")
def delete_pricing_plan(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, PricingPlan, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# --- FeatureHighlight ---
@router.get("/feature-highlights", response_model=List[FeatureHighlightOut])
def get_feature_highlights(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(FeatureHighlight).order_by(FeatureHighlight.sort_order).all()

@router.post("/feature-highlights", response_model=FeatureHighlightOut)
def create_feature_highlight(data: FeatureHighlightCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    data_dict = data.dict(exclude={"sort_order"})
    max_sort = db.query(func.max(FeatureHighlight.sort_order)).scalar()
    data_dict["sort_order"] = (max_sort or 0) + 1
    item = FeatureHighlight(**data_dict)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/feature-highlights/{item_id}", response_model=FeatureHighlightOut)
def update_feature_highlight(item_id: int, data: FeatureHighlightUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, FeatureHighlight, item_id)
    for k, v in data.dict(exclude_unset=True, exclude={"sort_order"}).items():
        if v is not None: setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/feature-highlights/{item_id}")
def delete_feature_highlight(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, FeatureHighlight, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- DashboardPreview ---
@router.get("/dashboard-previews", response_model=List[DashboardPreviewOut])
def get_dashboard_previews(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(DashboardPreview).order_by(DashboardPreview.sort_order).all()

@router.post("/dashboard-previews", response_model=DashboardPreviewOut)
def create_dashboard_preview(data: DashboardPreviewCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    max_order = db.query(func.max(DashboardPreview.sort_order)).scalar()
    order = (max_order or 0) + 1 if data.sort_order == 0 else data.sort_order
    item_dict = data.dict(exclude={"sort_order"})
    item = DashboardPreview(**item_dict, sort_order=order)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/dashboard-previews/{item_id}", response_model=DashboardPreviewOut)
def update_dashboard_preview(item_id: int, data: DashboardPreviewUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, DashboardPreview, item_id)
    for k, v in data.dict(exclude_unset=True, exclude={"sort_order"}).items():
        if v is not None: setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/dashboard-previews/{item_id}")
def delete_dashboard_preview(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, DashboardPreview, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- DetectGroup ---
@router.get("/detect-groups", response_model=List[DetectGroupOut])
def get_detect_groups(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(DetectGroup).order_by(DetectGroup.sort_order).all()

@router.post("/detect-groups", response_model=DetectGroupOut)
def create_detect_group(data: DetectGroupCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    col_dict = data.dict(exclude={"tags", "sort_order"})
    max_order = db.query(func.max(DetectGroup.sort_order)).scalar()
    order = (max_order or 0) + 1 if data.sort_order == 0 else data.sort_order
    
    item = DetectGroup(**col_dict, sort_order=order)
    db.add(item)
    db.flush()
    
    for i, t_data in enumerate(data.tags, 1):
        t_dict = t_data.dict(exclude={"sort_order", "id"})
        tag = DetectTag(**t_dict, group_id=item.id, sort_order=i)
        db.add(tag)
        
    db.commit()
    db.refresh(item)
    return item

@router.put("/detect-groups/{item_id}", response_model=DetectGroupOut)
def update_detect_group(item_id: int, data: DetectGroupUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, DetectGroup, item_id)
    update_data = data.dict(exclude_unset=True, exclude={"tags"})
    for k, v in update_data.items():
        if v is not None: setattr(item, k, v)
        
    if data.tags is not None:
        db.query(DetectTag).filter(DetectTag.group_id == item_id).delete()
        for i, t_data in enumerate(data.tags, 1):
            t_dict = t_data.dict(exclude={"sort_order", "id"})
            tag = DetectTag(**t_dict, group_id=item.id, sort_order=i)
            db.add(tag)
            
    db.commit()
    db.refresh(item)
    return item

@router.delete("/detect-groups/{item_id}")
def delete_detect_group(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, DetectGroup, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}



# --- FooterColumn ---
@router.get("/footer-columns", response_model=List[FooterColumnOut])
def get_footer_columns(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(FooterColumn).order_by(FooterColumn.sort_order).all()

@router.post("/footer-columns", response_model=FooterColumnOut)
def create_footer_column(data: FooterColumnCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    col_dict = data.dict(exclude={"links", "sort_order"})
    
    max_order = db.query(func.max(FooterColumn.sort_order)).scalar()
    order = (max_order or 0) + 1 if data.sort_order == 0 else data.sort_order
    
    item = FooterColumn(**col_dict, sort_order=order)
    db.add(item)
    db.flush()
    
    for i, l_data in enumerate(data.links, 1):
        l_dict = l_data.dict(exclude={"sort_order", "id"})
        link = FooterLink(**l_dict, column_id=item.id, sort_order=i)
        db.add(link)
        
    db.commit()
    db.refresh(item)
    return item

@router.put("/footer-columns/{item_id}", response_model=FooterColumnOut)
def update_footer_column(item_id: int, data: FooterColumnUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, FooterColumn, item_id)
    update_data = data.dict(exclude_unset=True, exclude={"links"})
    for k, v in update_data.items():
        if v is not None: setattr(item, k, v)
        
    if data.links is not None:
        db.query(FooterLink).filter(FooterLink.column_id == item_id).delete()
        for i, l_data in enumerate(data.links, 1):
            l_dict = l_data.dict(exclude={"sort_order", "id"})
            link = FooterLink(**l_dict, column_id=item.id, sort_order=i)
            db.add(link)
            
    db.commit()
    db.refresh(item)
    return item

@router.delete("/footer-columns/{item_id}")
def delete_footer_column(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, FooterColumn, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}



# --- CustomDataBlock ---
@router.get("/custom-data-blocks", response_model=List[CustomDataBlockOut])
def get_custom_data_blocks(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(CustomDataBlock).order_by(CustomDataBlock.sort_order).all()

@router.post("/custom-data-blocks", response_model=CustomDataBlockOut)
def create_custom_data_block(data: CustomDataBlockCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = CustomDataBlock(**data.dict())
    if not item.sort_order:
        max_order = db.query(func.coalesce(func.max(CustomDataBlock.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/custom-data-blocks/{item_id}", response_model=CustomDataBlockOut)
def update_custom_data_block(item_id: int, data: CustomDataBlockUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, CustomDataBlock, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None: setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/custom-data-blocks/{item_id}")
def delete_custom_data_block(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, CustomDataBlock, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}

# --- NavItem ---
@router.get("/nav-items", response_model=List[NavItemOut])
def get_nav_items(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(NavItem).order_by(NavItem.sort_order).all()

@router.post("/nav-items", response_model=NavItemOut)
def create_nav_item(data: NavItemCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = NavItem(**data.dict())
    if item.sort_order == 0:
        max_order = db.query(func.coalesce(func.max(NavItem.sort_order), 0)).scalar()
        item.sort_order = max_order + 1
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/nav-items/{item_id}", response_model=NavItemOut)
def update_nav_item(item_id: int, data: NavItemUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, NavItem, item_id)
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None: setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/nav-items/{item_id}")
def delete_nav_item(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, NavItem, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# Contact Messages

from app.schemas.admin import ContactMessageOut

@router.get('/contact-messages', response_model=List[ContactMessageOut])
def get_contact_messages(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

@router.delete('/contact-messages/{message_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    message = get_or_404(db, ContactMessage, message_id)
    db.delete(message)
    db.commit()
    return None




# Users

from app.schemas.admin import UserOut, UserCreate, UserUpdate
from app.core.security import hash_password

@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("/users", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    user_dict = data.dict(exclude={"password"})
    user = User(**user_dict)
    if data.password:
        user.password_hash = hash_password(data.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    user = get_or_404(db, User, user_id)
    for k, v in data.dict(exclude_unset=True, exclude={"password"}).items():
        setattr(user, k, v)
    if data.password:
        user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    user = get_or_404(db, User, user_id)
    db.delete(user)
    db.commit()
    return {"ok": True}

# --- Websites ---
@router.get("/websites", response_model=PaginatedWebsiteOut)
def get_websites(
    page: int = 1, 
    limit: int = 20, 
    search: str = "", 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin_user)
):
    query = db.query(Website)
    if search:
        query = query.filter(Website.domain.ilike(f"%{search}%") | Website.company_name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(Website.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    for w in items:
        w.technology_ids = [t.technology_id for t in w.technologies]
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.post("/websites", response_model=WebsiteAdminOut)
def create_website(data: WebsiteCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    website_dict = data.dict(exclude={"technology_ids", "sort_order"})
    max_order = db.query(func.max(Website.sort_order)).scalar()
    order = (max_order or 0) + 1 if data.sort_order == 0 else data.sort_order
    
    item = Website(**website_dict, sort_order=order)
    db.add(item)
    db.flush()
    
    for tech_id in data.technology_ids:
        wt = WebsiteTechnology(website_id=item.id, technology_id=tech_id)
        db.add(wt)
        
    db.commit()
    db.refresh(item)
    item.technology_ids = [t.technology_id for t in item.technologies]
    return item

@router.put("/websites/{item_id}", response_model=WebsiteAdminOut)
def update_website(item_id: int, data: WebsiteUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, Website, item_id)
    update_data = data.dict(exclude_unset=True, exclude={"technology_ids"})
    
    for k, v in update_data.items():
        if v is not None: setattr(item, k, v)
        
    if data.technology_ids is not None:
        db.query(WebsiteTechnology).filter(WebsiteTechnology.website_id == item_id).delete()
        for tech_id in data.technology_ids:
            wt = WebsiteTechnology(website_id=item.id, technology_id=tech_id)
            db.add(wt)
            
    db.commit()
    db.refresh(item)
    item.technology_ids = [t.technology_id for t in item.technologies]
    return item

@router.delete("/websites/{item_id}")
def delete_website(item_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    item = get_or_404(db, Website, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}
