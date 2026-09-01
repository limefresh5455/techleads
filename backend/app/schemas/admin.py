from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon: str = "folder"
    item_count: int = 0
    sort_order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
    item_count: Optional[int] = None
    sort_order: Optional[int] = None

class TechnologyCreate(BaseModel):
    name: str
    slug: str
    icon: str = "globe"
    icon_color: str = "#FF6B35"
    website_count: int = 0
    growth_percent: float = 0.0
    category_id: Optional[int] = None
    is_featured: bool = True
    is_popular: bool = False
    sort_order: int = 0

class TechnologyUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
    icon_color: Optional[str] = None
    website_count: Optional[int] = None
    growth_percent: Optional[float] = None
    category_id: Optional[int] = None
    is_featured: Optional[bool] = None
    is_popular: Optional[bool] = None
    sort_order: Optional[int] = None

class PlanFeatureCreate(BaseModel):
    label: str
    value_text: Optional[str] = None
    included: bool = True
    sort_order: int = 0

class PricingPlanCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    monthly_price: int = 0
    yearly_price: int = 0
    credits: int = 0
    is_popular: bool = False
    cta_label: str = "Get Started"
    sort_order: int = 0
    features: List[PlanFeatureCreate] = []

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    monthly_price: Optional[int] = None
    yearly_price: Optional[int] = None
    credits: Optional[int] = None
    is_popular: Optional[bool] = None
    features: Optional[List[PlanFeatureCreate]] = None
    cta_label: Optional[str] = None
    sort_order: Optional[int] = None

class FeatureHighlightCreate(BaseModel):
    title: str
    description: str
    icon: str = "sparkles"
    variant: str = "card"
    tags: str = ""
    sort_order: int = 0

class FeatureHighlightUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    variant: Optional[str] = None
    tags: Optional[str] = None
    sort_order: Optional[int] = None

class NavItemCreate(BaseModel):
    label: str
    href: str
    has_dropdown: bool = False
    parent_id: Optional[int] = None
    sort_order: int = 0

class NavItemUpdate(BaseModel):
    label: Optional[str] = None
    href: Optional[str] = None
    has_dropdown: Optional[bool] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None

class DashboardPreviewCreate(BaseModel):
    domain: str
    categories: str = ""
    technologies: str = ""
    country: str = ""
    traffic: str
    ads: str = ""
    sort_order: int = 0

class DashboardPreviewUpdate(BaseModel):
    domain: Optional[str] = None
    categories: Optional[str] = None
    technologies: Optional[str] = None
    country: Optional[str] = None
    traffic: Optional[str] = None
    ads: Optional[str] = None
    sort_order: Optional[int] = None

class DetectGroupCreate(BaseModel):
    title: str
    theme: str = "orange"
    sort_order: int = 0

class DetectGroupUpdate(BaseModel):
    title: Optional[str] = None
    theme: Optional[str] = None
    sort_order: Optional[int] = None



class FooterLinkCreate(BaseModel):
    id: Optional[int] = None
    label: str
    href: str = "/"
    sort_order: int = 0

class FooterColumnCreate(BaseModel):
    title: str
    sort_order: int = 0
    links: List[FooterLinkCreate] = []

class FooterColumnUpdate(BaseModel):
    title: Optional[str] = None
    sort_order: Optional[int] = None
    links: Optional[List[FooterLinkCreate]] = None

class SocialLinkCreate(BaseModel):
    label: str
    href: str = "/"
    icon_key: str
    sort_order: int = 0

class SocialLinkUpdate(BaseModel):
    label: Optional[str] = None
    href: Optional[str] = None
    icon_key: Optional[str] = None
    sort_order: Optional[int] = None

class LegalLinkCreate(BaseModel):
    label: str
    href: str = "/"
    sort_order: int = 0

class LegalLinkUpdate(BaseModel):
    label: Optional[str] = None
    href: Optional[str] = None
    sort_order: Optional[int] = None

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    summary: str = ""
    category: str = "Guides"
    sort_order: int = 0

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[str] = None
    sort_order: Optional[int] = None

class FaqItemCreate(BaseModel):
    question: str
    answer: str
    sort_order: int = 0

class FaqItemUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    sort_order: Optional[int] = None

class SiteContentUpdate(BaseModel):
    brand_name: Optional[str] = None
    brand_suffix: Optional[str] = None
    logo_text: Optional[str] = None
    login_label: Optional[str] = None
    nav_cta_label: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_search_placeholder: Optional[str] = None
    hero_search_cta: Optional[str] = None
    hero_secondary_cta: Optional[str] = None
    popular_eyebrow: Optional[str] = None
    popular_title: Optional[str] = None
    features_eyebrow: Optional[str] = None
    features_title: Optional[str] = None
    detect_eyebrow: Optional[str] = None
    detect_title: Optional[str] = None
    enrich_eyebrow: Optional[str] = None
    enrich_title: Optional[str] = None
    enrich_subtitle: Optional[str] = None
    enrich_cta: Optional[str] = None
    api_eyebrow: Optional[str] = None
    api_title: Optional[str] = None
    api_subtitle: Optional[str] = None
    api_cta: Optional[str] = None
    api_sample: Optional[str] = None
    final_cta_title: Optional[str] = None
    final_cta_primary: Optional[str] = None
    final_cta_secondary: Optional[str] = None
    pricing_title: Optional[str] = None
    pricing_subtitle: Optional[str] = None
    pricing_yearly_badge: Optional[str] = None
    calculator_title: Optional[str] = None
    calculator_subtitle: Optional[str] = None
    calculator_default_leads: Optional[int] = None
    contact_title: Optional[str] = None
    contact_subtitle: Optional[str] = None
    contact_button_label: Optional[str] = None
    footer_about: Optional[str] = None
    footer_copyright: Optional[str] = None
    chat_label: Optional[str] = None

class CustomDataBlockCreate(BaseModel):
    title: str
    description: str
    sort_order: int = 0

class CustomDataBlockUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None

class DashboardPreviewOut(BaseModel):
    id: int
    domain: str
    categories: str
    technologies: str
    country: str
    traffic: str
    ads: str
    sort_order: int

    class Config:
        from_attributes = True

class CreditPurchaseOut(BaseModel):
    id: int
    plan_slug: str
    credits: int
    amount_cents: int
    currency: str
    status: str
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    credits: int
    created_at: datetime
    credit_purchases: List[CreditPurchaseOut] = []

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: str
    role: Optional[str] = 'customer'
    credits: Optional[int] = 0
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    credits: Optional[int] = None

class ContactMessageOut(BaseModel):
    id: int
    name: str
    email: str
    company_website: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class CustomDataBlockOut(BaseModel):
    id: int
    domain: str
    data: str
    categories: str = ""
    sort_order: int = 0
    
    class Config:
        from_attributes = True

