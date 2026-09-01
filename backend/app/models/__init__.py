from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False)
    slug = Column(String(140), unique=True, nullable=False)
    icon = Column(String(80), default="folder")
    item_count = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)

    technologies = relationship("Technology", back_populates="category")


class Technology(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), unique=True, nullable=False)
    slug = Column(String(180), unique=True, nullable=False)
    icon = Column(String(80), default="globe")
    icon_color = Column(String(40), default="#FF6B35")
    website_count = Column(Integer, default=0)
    growth_percent = Column(Float, default=0.0)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_featured = Column(Boolean, default=True)
    is_popular = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    category = relationship("Category", back_populates="technologies")
    websites = relationship("WebsiteTechnology", back_populates="technology")


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(160), unique=True, nullable=False, index=True)
    company_name = Column(String(200), default="")
    title = Column(String(200), default="")
    description = Column(Text, default="")
    emails = Column(Text, default="")
    country = Column(String(120), default="")
    category_label = Column(String(120), default="Uncategorized")
    contact_info = Column(Text, default="No contact information available")
    facebook_url = Column(String(255), default="")
    twitter_url = Column(String(255), default="")
    linkedin_url = Column(String(255), default="")
    instagram_url = Column(String(255), default="")
    youtube_url = Column(String(255), default="")
    github_url = Column(String(255), default="")
    tiktok_url = Column(String(255), default="")
    tech_spend_monthly = Column(Float, default=0.0)
    tech_spend_annual = Column(Float, default=0.0)
    extra_technologies = Column(Text, default="")
    source_url = Column(String(255), default="")
    signals_json = Column(Text, default="")
    enriched_json = Column(Text, default="")
    last_crawled_at = Column(DateTime(timezone=True), nullable=True)
    rank = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)

    # AI enrichment detail columns (also mirrored in enriched_json)
    subcategory = Column(String(120), default="")
    industry = Column(String(120), default="")
    company_type = Column(String(80), default="")
    business_summary = Column(Text, default="")
    marketing_stack = Column(Text, default="")  # comma-separated
    analytics_tools = Column(Text, default="")
    payment_providers = Column(Text, default="")
    cms_platform = Column(String(120), default="")
    ecommerce_platform = Column(String(120), default="")
    hosting_cdn = Column(String(120), default="")
    key_features = Column(Text, default="")  # newline or | separated
    target_audience = Column(String(300), default="")
    phone = Column(String(80), default="")
    address = Column(String(300), default="")
    estimated_traffic_tier = Column(String(40), default="")
    confidence_score = Column(Integer, default=0)
    llm_insights = Column(Text, default="")  # newline-separated
    llm_used = Column(Boolean, default=False)
    llm_error = Column(Text, default="")
    llm_provider = Column(String(40), default="")
    llm_model = Column(String(120), default="")

    technologies = relationship(
        "WebsiteTechnology", back_populates="website", cascade="all, delete-orphan"
    )


class WebsiteTechnology(Base):
    __tablename__ = "website_technologies"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    technology_id = Column(Integer, ForeignKey("technologies.id"), nullable=False)

    website = relationship("Website", back_populates="technologies")
    technology = relationship("Technology", back_populates="websites")


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    total_websites = Column(Integer, default=0)
    processed_websites = Column(Integer, default=0)
    failed_websites = Column(Integer, default=0)
    errors_json = Column(Text, default="[]")
    created_at = Column(DateTime(timezone=True), default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class PricingPlan(Base):
    __tablename__ = "pricing_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, default="")
    monthly_price = Column(Integer, default=0)
    yearly_price = Column(Integer, default=0)
    credits = Column(Integer, default=0)
    is_popular = Column(Boolean, default=False)
    cta_label = Column(String(80), default="Get Started")
    sort_order = Column(Integer, default=0)

    features = relationship("PlanFeature", back_populates="plan", cascade="all, delete-orphan")


class PlanFeature(Base):
    __tablename__ = "plan_features"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("pricing_plans.id"), nullable=False)
    label = Column(String(255), nullable=False)
    value_text = Column(String(255), nullable=True)
    included = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    plan = relationship("PricingPlan", back_populates="features")


class FeatureHighlight(Base):
    __tablename__ = "feature_highlights"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(80), default="sparkles")
    variant = Column(String(40), default="card")  # hero | card | banner
    tags = Column(String(255), default="")  # comma-separated
    sort_order = Column(Integer, default=0)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    email = Column(String(255), nullable=False)
    company_website = Column(String(255), default="")
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NavItem(Base):
    __tablename__ = "nav_items"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(80), nullable=False)
    href = Column(String(160), nullable=False)
    has_dropdown = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("nav_items.id"), nullable=True)
    sort_order = Column(Integer, default=0)

    children = relationship(
        "NavItem",
        back_populates="parent",
        cascade="all, delete-orphan",
    )
    parent = relationship("NavItem", back_populates="children", remote_side=[id])


class SiteContent(Base):
    __tablename__ = "site_content"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(80), default="TechLeads")
    brand_suffix = Column(String(20), default=".Ai")
    logo_text = Column(String(10), default="Ai")
    login_label = Column(String(40), default="Log in")
    nav_cta_label = Column(String(40), default="Start for free")

    hero_title = Column(String(255), default="Website Technology Checker for Sales & Agencies")
    hero_subtitle = Column(Text, default="")
    hero_search_placeholder = Column(String(255), default="e.g., website.com")
    hero_search_cta = Column(String(80), default="Analyze")
    hero_secondary_cta = Column(String(80), default="Generate Lead List")

    popular_eyebrow = Column(String(80), default="POPULAR TECHNOLOGIES")
    popular_title = Column(String(160), default="Popular Technologies")

    features_eyebrow = Column(String(80), default="WHY CHOOSE TECHLEADS")
    features_title = Column(String(200), default="Everything you need to understand the web")

    detect_eyebrow = Column(String(80), default="THE POWER OF DISCOVERY")
    detect_title = Column(String(160), default="What we detect")

    enrich_eyebrow = Column(String(80), default="DATA ENRICHMENT")
    enrich_title = Column(String(200), default="Enrich your entire prospect list in seconds")
    enrich_subtitle = Column(Text, default="")
    enrich_cta = Column(String(80), default="Try Data Enrichment")

    api_eyebrow = Column(String(80), default="DEVELOPER-READY")
    api_title = Column(String(200), default="Integrate TechLeads.Ai Into Your Own Stack")
    api_subtitle = Column(Text, default="")
    api_cta = Column(String(80), default="View API Documentation")
    api_sample = Column(Text, default="")

    final_cta_title = Column(String(255), default="")
    final_cta_primary = Column(String(80), default="Get Started")
    final_cta_secondary = Column(String(80), default="View Pricing")

    pricing_title = Column(String(160), default="Simple, transparent pricing")
    pricing_subtitle = Column(Text, default="")
    pricing_yearly_badge = Column(String(40), default="Save 20%")
    calculator_title = Column(String(160), default="How much data do you need?")
    calculator_subtitle = Column(Text, default="")
    calculator_default_leads = Column(Integer, default=10000)

    contact_title = Column(String(120), default="Get In Touch")
    contact_subtitle = Column(Text, default="")
    contact_button_label = Column(String(80), default="Send Message")

    footer_about = Column(Text, default="")
    footer_copyright = Column(String(160), default="TechLeads.Ai. All rights reserved.")
    chat_label = Column(String(80), default="Chat with us")


class DashboardPreview(Base):
    __tablename__ = "dashboard_previews"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(160), nullable=False)
    categories = Column(String(160), default="")
    technologies = Column(String(160), default="")
    country = Column(String(80), default="")
    traffic = Column(String(40), nullable=False)
    ads = Column(String(40), default="")
    sort_order = Column(Integer, default=0)


class DetectGroup(Base):
    __tablename__ = "detect_groups"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    theme = Column(String(40), default="orange")  # orange | peach | mint
    sort_order = Column(Integer, default=0)

    tags = relationship("DetectTag", back_populates="group", cascade="all, delete-orphan")


class DetectTag(Base):
    __tablename__ = "detect_tags"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("detect_groups.id"), nullable=False)
    label = Column(String(80), nullable=False)
    sort_order = Column(Integer, default=0)

    group = relationship("DetectGroup", back_populates="tags")





class FooterColumn(Base):
    __tablename__ = "footer_columns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(80), nullable=False)
    sort_order = Column(Integer, default=0)

    links = relationship("FooterLink", back_populates="column", cascade="all, delete-orphan")


class FooterLink(Base):
    __tablename__ = "footer_links"

    id = Column(Integer, primary_key=True, index=True)
    column_id = Column(Integer, ForeignKey("footer_columns.id"), nullable=False)
    label = Column(String(120), nullable=False)
    href = Column(String(160), default="/")
    sort_order = Column(Integer, default=0)

    column = relationship("FooterColumn", back_populates="links")


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(80), nullable=False)
    href = Column(String(160), default="/")
    icon_key = Column(String(40), nullable=False)
    sort_order = Column(Integer, default=0)


class LegalLink(Base):
    __tablename__ = "legal_links"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(80), nullable=False)
    href = Column(String(160), default="/")
    sort_order = Column(Integer, default=0)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False)
    summary = Column(Text, default="")
    category = Column(String(80), default="Guides")
    sort_order = Column(Integer, default=0)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False, default="")
    google_sub = Column(String(255), unique=True, nullable=True, index=True)
    avatar_url = Column(String(500), default="")
    credits = Column(Integer, default=0)
    role = Column(String(50), default="customer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    credit_purchases = relationship("CreditPurchase", back_populates="user", cascade="all, delete-orphan")

class CreditPurchase(Base):
    __tablename__ = "credit_purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan_slug = Column(String(100), nullable=False)
    credits = Column(Integer, nullable=False)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="usd")
    stripe_session_id = Column(String(255), unique=True, nullable=False, index=True)
    stripe_payment_intent = Column(String(255), default="")
    status = Column(String(40), default="pending")  # pending | paid | failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="credit_purchases")


class UserToken(Base):
    __tablename__ = "user_tokens"

    token = Column(String(255), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FaqItem(Base):
    __tablename__ = "faq_items"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)


class CustomDataBlock(Base):
    __tablename__ = "custom_data_blocks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    description = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
