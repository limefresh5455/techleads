from pydantic import BaseModel, EmailStr, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    icon: str
    item_count: int

    class Config:
        from_attributes = True


class TechnologyOut(BaseModel):
    id: int
    name: str
    slug: str
    icon: str
    icon_color: str
    website_count: int
    growth_percent: float
    category_id: int | None = None
    is_featured: bool
    is_popular: bool = False

    class Config:
        from_attributes = True


class PlanFeatureOut(BaseModel):
    id: int
    label: str
    included: bool

    class Config:
        from_attributes = True


class PricingPlanOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    monthly_price: int
    yearly_price: int
    credits: int
    is_popular: bool
    cta_label: str
    features: list[PlanFeatureOut] = []

    class Config:
        from_attributes = True


class FeatureHighlightOut(BaseModel):
    id: int
    title: str
    description: str
    icon: str
    link_label: str
    variant: str = "card"
    tags: list[str] = []

    class Config:
        from_attributes = True


class NavItemOut(BaseModel):
    id: int
    label: str
    href: str
    has_dropdown: bool = False
    children: list["NavItemOut"] = []

    class Config:
        from_attributes = True


class DashboardPreviewOut(BaseModel):
    id: int
    domain: str
    categories: str = ""
    technologies: str = ""
    country: str = ""
    traffic: str
    ads: str = ""

    class Config:
        from_attributes = True


class DetectTagOut(BaseModel):
    id: int
    label: str

    class Config:
        from_attributes = True


class DetectGroupOut(BaseModel):
    id: int
    title: str
    theme: str
    tags: list[DetectTagOut] = []

    class Config:
        from_attributes = True


class TrustLogoOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class FooterLinkOut(BaseModel):
    id: int
    label: str
    href: str

    class Config:
        from_attributes = True


class FooterColumnOut(BaseModel):
    id: int
    title: str
    links: list[FooterLinkOut] = []

    class Config:
        from_attributes = True


class SocialLinkOut(BaseModel):
    id: int
    label: str
    href: str
    icon_key: str

    class Config:
        from_attributes = True


class LegalLinkOut(BaseModel):
    id: int
    label: str
    href: str

    class Config:
        from_attributes = True


class FreeToolOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    href: str
    cta_label: str = "Analyze"

    class Config:
        from_attributes = True


class ToolPopularItemOut(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class ToolFeatureOut(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class ToolFaqOut(BaseModel):
    id: int
    question: str
    answer: str

    class Config:
        from_attributes = True


class FreeToolDetailOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    href: str
    cta_label: str
    popular_title: str
    popular_subtitle: str
    features_title: str
    features_subtitle: str
    faq_title: str
    faq_subtitle: str
    final_cta_title: str
    final_cta_subtitle: str
    final_cta_label: str
    popular_items: list[ToolPopularItemOut] = []
    features: list[ToolFeatureOut] = []
    faqs: list[ToolFaqOut] = []

    class Config:
        from_attributes = True


class BlogPostOut(BaseModel):
    id: int
    title: str
    slug: str
    summary: str
    category: str

    class Config:
        from_attributes = True


class FaqItemOut(BaseModel):
    id: int
    question: str
    answer: str

    class Config:
        from_attributes = True


class CustomDataBlockOut(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class SiteContentOut(BaseModel):
    brand_name: str
    brand_suffix: str
    logo_text: str
    login_label: str
    nav_cta_label: str
    hero_title: str
    hero_subtitle: str
    hero_search_placeholder: str
    hero_search_cta: str
    hero_secondary_cta: str
    popular_eyebrow: str
    popular_title: str
    features_eyebrow: str
    features_title: str
    detect_eyebrow: str
    detect_title: str
    enrich_eyebrow: str
    enrich_title: str
    enrich_subtitle: str
    enrich_cta: str
    api_eyebrow: str
    api_title: str
    api_subtitle: str
    api_cta: str
    api_sample: str
    final_cta_title: str
    final_cta_primary: str
    final_cta_secondary: str
    pricing_title: str
    pricing_subtitle: str
    pricing_yearly_badge: str
    calculator_title: str
    calculator_subtitle: str
    calculator_default_leads: int
    contact_title: str
    contact_subtitle: str
    contact_button_label: str
    footer_about: str
    footer_copyright: str
    chat_label: str

    class Config:
        from_attributes = True


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class AuthUserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: AuthUserOut


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    company_website: str = Field(default="", max_length=255)
    message: str = Field(min_length=5, max_length=5000)


class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    company_website: str
    message: str

    class Config:
        from_attributes = True


class LandingPayload(BaseModel):
    content: SiteContentOut
    nav_items: list[NavItemOut]
    technologies: list[TechnologyOut]
    popular_technologies: list[TechnologyOut]
    categories: list[CategoryOut]
    pricing_plans: list[PricingPlanOut]
    feature_highlights: list[FeatureHighlightOut]
    dashboard_previews: list[DashboardPreviewOut]
    detect_groups: list[DetectGroupOut]
    trust_logos: list[TrustLogoOut]
    footer_columns: list[FooterColumnOut]
    social_links: list[SocialLinkOut]
    legal_links: list[LegalLinkOut]
    free_tools: list[FreeToolOut]
    blog_posts: list[BlogPostOut]
    faqs: list[FaqItemOut] = []
    custom_data_blocks: list[CustomDataBlockOut] = []
