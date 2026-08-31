from sqlalchemy.orm import Session

from app.models import (
    BlogPost,
    Category,
    DashboardPreview,
    DetectGroup,
    DetectTag,
    FeatureHighlight,
    FooterColumn,
    FooterLink,
    LegalLink,
    NavItem,
    PlanFeature,
    PricingPlan,
    SiteContent,
    SocialLink,
    Technology,
    Website,
    WebsiteTechnology,
)


def seed_database(db: Session) -> None:
    _sync_nav(db)
    _seed_core(db)
    _seed_site_content(db)
    _sync_branding(db)
    _sync_social_links(db)
    _sync_footer(db)
    _sync_blog_posts(db)
    _sync_features(db)
    _sync_detect_groups(db)
    _sync_faqs(db)
    _sync_custom_data_blocks(db)
    _sync_pricing(db)
    _sync_websites(db)
    db.commit()


def _sync_features(db: Session) -> None:
    db.query(FeatureHighlight).delete()
    db.flush()
    _seed_features(db)


def _sync_detect_groups(db: Session) -> None:
    db.query(DetectTag).delete()
    db.query(DetectGroup).delete()
    db.flush()
    _seed_detect_groups(db)

def _sync_nav(db: Session) -> None:
    db.query(NavItem).filter(NavItem.parent_id.isnot(None)).delete()
    db.query(NavItem).delete()
    db.flush()



    for i, (label, href) in enumerate(
        [
            ("Blog", "/blog"),
            ("Pricing", "/pricing"),
        ],
        start=1,
    ):
        db.add(NavItem(label=label, href=href, has_dropdown=False, sort_order=i))


def _sync_branding(db: Session) -> None:
    content = db.query(SiteContent).first()
    if not content:
        return
    content.brand_name = "TechLeads"
    content.brand_suffix = ".Ai"
    content.logo_text = "Ai"
    content.login_label = "Sign In"
    content.nav_cta_label = "Start My Free Trial"
    content.hero_title = "Website Technology Checker for Sales & Agencies"
    content.hero_subtitle = (
        "Instantly detect what any website is built with — CMS platforms, JavaScript frameworks, "
        "Ecommerce systems, analytics & more. Build targeted lists of sites using specific technologies."
    )
    content.hero_search_placeholder = "Enter a website URL…"
    content.hero_search_cta = "Analyze"
    content.hero_secondary_cta = "Generate Your First List"
    content.popular_eyebrow = "BROWSE BY STACK"
    content.popular_title = "Popular Technologies"
    content.features_eyebrow = "WHAT TECHLEADS DOES"
    content.features_title = "Everything you need to understand the web"
    content.detect_eyebrow = "DETECTION COVERAGE"
    content.detect_title = "What we detect"
    content.enrich_eyebrow = "BULK LOOKUP"
    content.enrich_title = "Enrich your entire prospect list in seconds"
    content.enrich_subtitle = (
        "Upload a CSV of domains — TechLeads.Ai detects the tech stack and finds contact emails for every row automatically."
    )
    content.enrich_cta = "Try Bulk Lookup"
    content.api_eyebrow = "DEVELOPER API"
    content.api_title = "Integrate TechLeads.Ai Into Your Own Stack"
    content.api_subtitle = (
        "The TechLeads.Ai API is live and ready to use. Detect tech stacks programmatically at scale."
    )
    content.api_cta = "Get API Access"
    content.api_sample = (
        "$ curl -X POST \\\n"
        "  https://api.techleads.ai/v1/detect \\\n"
        "  -H \"X-API-Key: tl_live_••••••••\" \\\n"
        "  -d '{\"url\": \"shopify.com\"}'\n\n"
        "// 200 OK · 312ms\n"
        "{\n"
        '  "url": "https://shopify.com",\n'
        '  "detected": ["Shopify", "Ruby on Rails", "AWS"],\n'
        '  "emails": ["press@shopify.com"]\n'
        "}"
    )
    content.final_cta_title = (
        "Get qualified leads filtered by technology. Access websites using Shopify, React, WordPress, and more."
    )
    content.final_cta_primary = "Get Started"
    content.final_cta_secondary = "View Pricing"
    content.footer_about = (
        "TechLeads.Ai helps sales and agencies detect website technologies, enrich prospect lists, "
        "and generate high-intent leads."
    )
    content.footer_copyright = "TechLeads.Ai"
    content.pricing_title = "Simple, transparent pricing"
    content.pricing_subtitle = (
        "Choose the plan that fits your needs. Bulk datasets are $29 per technology. "
        "Growth and Business packs add enrichment credits for exports and API use."
    )
    content.pricing_yearly_badge = "Best value"
    content.calculator_title = "How credits work"
    content.calculator_subtitle = (
        "1 credit = 1 technology CSV export. Free preview shows 10 records without a filter."
    )
    content.contact_title = "Contact sales"
    content.contact_subtitle = "Talk to our team about custom data, API access, or enterprise plans."


def _sync_social_links(db: Session) -> None:
    socials = [
        ("Facebook", "https://facebook.com", "facebook"),
        ("LinkedIn", "https://linkedin.com", "linkedin"),
        ("X", "https://x.com", "x"),
        ("Instagram", "https://instagram.com", "instagram"),
    ]
    existing = db.query(SocialLink).order_by(SocialLink.sort_order).all()
    if not existing:
        for i, (label, href, icon_key) in enumerate(socials):
            db.add(SocialLink(label=label, href=href, icon_key=icon_key, sort_order=i))
        return
    for i, row in enumerate(existing):
        if i < len(socials):
            row.label, row.href, row.icon_key = socials[i]
            row.sort_order = i


def _sync_footer(db: Session) -> None:
    db.query(FooterLink).delete()
    db.query(FooterColumn).delete()
    db.flush()
    footer = {
        "Products": [
            ("Home", "/"),
            ("Pricing", "/pricing"),
            ("API Docs", "/api-docs"),
            ("Blog", "/blog"),
            ("Sign Up", "/signup"),
        ],
        "Resources": [
            ("Browse by Technology", "/directory"),
            ("Documentation", "/api-docs"),
            ("Support Center", "/contact"),
            ("Privacy Policy", "/privacy"),
            ("Terms of Service", "/terms"),
        ],
        "Connect With Us": [
            ("Contact", "/contact"),
            ("Sign In", "/signin"),
            ("Start Free Trial", "/signup"),
        ],
    }
    for i, (title, links) in enumerate(footer.items()):
        col = FooterColumn(title=title, sort_order=i)
        db.add(col)
        db.flush()
        for j, (label, href) in enumerate(links):
            db.add(FooterLink(column_id=col.id, label=label, href=href, sort_order=j))

    db.query(LegalLink).delete()
    db.flush()
    for i, (label, href) in enumerate(
        [("Privacy Policy", "/privacy"), ("Terms of Service", "/terms")]
    ):
        db.add(LegalLink(label=label, href=href, sort_order=i))


def _sync_blog_posts(db: Session) -> None:
    db.query(BlogPost).delete()
    db.flush()
    posts = [
        (
            "Best Technographic Data Providers in 2026: A Complete Comparison",
            "technographic-data-providers-2026",
            "Compare the top technographic data providers — TechLeads.Ai, BuiltWith, Wappalyzer, Datanyze, ZoomInfo, and Apollo — across detection accuracy, lead gen, API access, and GTM fit.",
            "Comparison",
        ),
        (
            "Best Website Technology Checker Tools (2026)",
            "best-website-technology-checker-tools-2026",
            "Explore the most accurate and reliable website technology checker tools. Compare TechLeads.Ai, Wappalyzer, BuiltWith, and WhatRuns for CMS detection, lead generation, and market research.",
            "Guide",
        ),
        (
            "Top 6 Wappalyzer Alternatives (2026)",
            "wappalyzer-alternatives-2026",
            "Discover the best Wappalyzer alternatives in 2026. Compare TechLeads.Ai, BuiltWith, WhatRuns, SimilarTech & more to find your ideal tech stack tool.",
            "Comparison",
        ),
        (
            "Best StoreLeads Alternative (2026)",
            "storeleads-alternative-2026",
            "Looking for a StoreLeads alternative? TechLeads.Ai offers affordable ecommerce lead generation, Shopify store discovery, and technology detection starting free.",
            "Comparison",
        ),
        (
            "BuiltWith Alternatives: 6 Best Tools",
            "builtwith-alternatives",
            "Discover the top 6 BuiltWith alternatives including TechLeads.Ai, Wappalyzer, WebTechSurvey, Bloomberry, Snov.io, and Web Reveal for website tech detection.",
            "Comparison",
        ),
    ]
    for i, (title, slug, summary, category) in enumerate(posts):
        db.add(BlogPost(title=title, slug=slug, summary=summary, category=category, sort_order=i))


def _sync_faqs(db: Session) -> None:
    from app.models import FaqItem

    db.query(FaqItem).delete()
    db.flush()
    faqs = [
        (
            "What are Enrichment Credits?",
            "Credits power technology CSV exports and enrichment. 1 credit exports one selected technology’s matching sites. Unused prepaid credits never expire.",
        ),
        (
            "What does Bulk Purchase include?",
            "Pay $29 per technology for a one-time dataset export credit. Choose how many technologies you need, pay once, and export those lead lists from the dashboard.",
        ),
        (
            "What does the Growth plan include?",
            "Growth adds 5,000 enrichment credits in one purchase — enough for large multi-technology exports, keyword-style filtering, and ongoing prospecting. Secure Stripe checkout.",
        ),
        (
            "What does the Business plan include?",
            "Business adds 25,000 enrichment credits plus higher-volume export capacity for teams that need unlimited technology coverage and frequent CSV downloads.",
        ),
        (
            "How do dashboard credits work?",
            "Without a technology filter you can preview the first 10 records free. Select technologies to browse all matches free. Export costs 1 credit per selected technology.",
        ),
        (
            "How do I buy credits?",
            "Choose Bulk, Growth, or Business on the Pricing page and checkout securely with Stripe. Credits are added as soon as payment succeeds.",
        ),
        (
            "Can I get an invoice?",
            "Stripe emails a receipt after purchase. For custom invoices or larger packs, contact sales.",
        ),
    ]
    for i, (q, a) in enumerate(faqs):
        db.add(FaqItem(question=q, answer=a, sort_order=i))


def _sync_custom_data_blocks(db: Session) -> None:
    from app.models import CustomDataBlock

    db.query(CustomDataBlock).delete()
    db.flush()
    blocks = [
        (
            "Enterprise Technology Intelligence",
            "Full-market visibility across millions of websites. Get technology adoption data, market share reports, and competitive signals for any industry or region.",
        ),
        (
            "Custom Technology Datasets",
            "Datasets filtered by technology stack and category — delivered as CSV, JSON, or synced directly to your data warehouse.",
        ),
        (
            "Lead Generation Campaigns",
            "Prospect lists built from technology signals. Target companies using specific tools, competitors' customers, or recent tech adopters — enriched with contact data.",
        ),
        (
            "Custom Technology Detection",
            "Detection rules for proprietary or niche technologies not in the standard library. Private categories, high-frequency crawls, and re-crawls.",
        ),
        (
            "API & Data Integrations",
            "Real-time detection API, bulk enrichment endpoint, and webhooks. Integrate with HubSpot, Salesforce, Clay, and n8n.",
        ),
        (
            "White Label & Reseller Access",
            "Full white-label API under your own domain and branding. Reseller pricing, embeddable widgets, and a dedicated account manager.",
        ),
    ]
    for i, (title, description) in enumerate(blocks):
        db.add(CustomDataBlock(title=title, description=description, sort_order=i))


def _sync_pricing(db: Session) -> None:
    db.query(PlanFeature).delete()
    db.query(PricingPlan).delete()
    db.flush()
    plans = [
        {
            "name": "Bulk Purchase",
            "slug": "bulk",
            "description": "One-time datasets for specific technologies",
            "monthly_price": 29,
            "yearly_price": 29,
            "credits": 1,
            "is_popular": False,
            "cta_label": "Select Technologies & Pay",
            "features": [
                "Choose technologies, pay once, own data forever",
                "$29 per technology export credit",
                "CSV export from the dashboard",
                "Ready for CRM import",
                "Secure Stripe checkout",
            ],
        },
        {
            "name": "Growth",
            "slug": "growth",
            "description": "Lead lists, keyword search, exports & API",
            "monthly_price": 79,
            "yearly_price": 79,
            "credits": 5000,
            "is_popular": True,
            "cta_label": "Buy Growth credits",
            "features": [
                "5,000 enrichment credits",
                "Full technology lead-list exports",
                "Unlimited dashboard browsing with tech filters",
                "1 credit = 1 technology CSV export",
                "Secure Stripe checkout",
            ],
        },
        {
            "name": "Business",
            "slug": "business",
            "description": "Unlimited technologies + API + priority volume",
            "monthly_price": 149,
            "yearly_price": 149,
            "credits": 25000,
            "is_popular": False,
            "cta_label": "Buy Business credits",
            "features": [
                "25,000 enrichment credits",
                "Unlimited technology exports (credit-based)",
                "Higher-volume CSV downloads",
                "Priority support",
                "Secure Stripe checkout",
            ],
        },
    ]
    for i, plan in enumerate(plans):
        row = PricingPlan(
            name=plan["name"],
            slug=plan["slug"],
            description=plan["description"],
            monthly_price=plan["monthly_price"],
            yearly_price=plan["yearly_price"],
            credits=plan["credits"],
            is_popular=plan["is_popular"],
            cta_label=plan["cta_label"],
            sort_order=i,
        )
        db.add(row)
        db.flush()
        for j, label in enumerate(plan["features"]):
            db.add(PlanFeature(plan_id=row.id, label=label, included=True, sort_order=j))


def _seed_core(db: Session) -> None:
    if db.query(Technology).first():
        return

    categories_data = [
        ("E-commerce", "ecommerce", "shopping-bag", 142580, 0),
        ("CMS", "cms", "layout", 98520, 1),
        ("Analytics", "analytics", "bar-chart-3", 76410, 2),
        ("Marketing", "marketing", "megaphone", 65320, 3),
        ("Payment", "payment", "credit-card", 54110, 4),
        ("CRM", "crm", "users", 43890, 5),
        ("Frameworks", "frameworks", "code", 39200, 6),
        ("Security", "security", "shield", 28750, 7),
    ]
    category_map: dict[str, Category] = {}
    for name, slug, icon, count, order in categories_data:
        cat = Category(name=name, slug=slug, icon=icon, item_count=count, sort_order=order)
        db.add(cat)
        category_map[slug] = cat
    db.flush()

    technologies_data = [
        ("WordPress", "wordpress", "layout", "#21759B", 530000, 3.2, "cms", 0, True),
        ("Shopify", "shopify", "shopping-bag", "#96BF48", 100000, 8.1, "ecommerce", 1, True),
        ("React", "react", "code", "#61DAFB", 63000, 11.4, "frameworks", 2, True),
        ("WooCommerce", "woocommerce", "shopping-cart", "#96588A", 165000, 5.6, "ecommerce", 3, True),
        ("Stripe", "stripe", "credit-card", "#635BFF", 9000, 11.2, "payment", 4, True),
        ("HubSpot", "hubspot", "users", "#FF7A59", 21000, 9.7, "crm", 5, True),
        ("Drupal", "drupal", "layout", "#0678BE", 18000, 1.8, "cms", 6, True),
        ("PayPal", "paypal", "credit-card", "#003087", 13000, 2.8, "payment", 7, True),
        ("Hotjar", "hotjar", "bar-chart-3", "#FD3A64", 23000, 7.4, "analytics", 8, True),
        ("Magento", "magento", "store", "#F26322", 12000, 1.5, "ecommerce", 9, True),
        ("Google Analytics", "google-analytics", "bar-chart-3", "#F9AB00", 5620180, 4.5, "analytics", 10, False),
        ("Next.js", "nextjs", "code", "#000000", 984210, 14.2, "frameworks", 11, False),
    ]
    for name, slug, icon, color, count, growth, cat_slug, order, popular in technologies_data:
        db.add(
            Technology(
                name=name,
                slug=slug,
                icon=icon,
                icon_color=color,
                website_count=count,
                growth_percent=growth,
                category_id=category_map[cat_slug].id,
                is_featured=True,
                is_popular=popular,
                sort_order=order,
            )
        )


def _seed_features(db: Session) -> None:
    highlights = [
        (
            "Instant Tech Stack Detection",
            "Enter any URL and get a full breakdown — frameworks, CMS, payment processors, CDNs, analytics tools, and more. Results in seconds.",
            "search",
            "Analyze a site",
            "hero",
            "React,Shopify,Next.js,Cloudflare,HubSpot,Stripe",
        ),
        (
            "Lead Generation",
            "Build targeted lists of websites filtered by the exact technologies they use. Find every Shopify store, every HubSpot customer.",
            "users",
            "Explore directory",
            "card",
            "",
        ),
        (
            "Competitive Intelligence",
            "See exactly what software competitors and industry leaders run. Spot trends before they become mainstream.",
            "bar-chart-3",
            "Learn more",
            "card",
            "",
        ),
        (
            "Bulk Lookup & Data Export",
            "Upload a CSV of domains and enrich every row with tech stack data and contact emails. Download instantly — ready for your CRM.",
            "list",
            "Try Bulk Lookup",
            "banner",
            "",
        ),
    ]
    for i, (title, description, icon, link_label, variant, tags) in enumerate(highlights):
        db.add(
            FeatureHighlight(
                title=title,
                description=description,
                icon=icon,
                link_label=link_label,
                variant=variant,
                tags=tags,
                sort_order=i,
            )
        )


def _seed_detect_groups(db: Session) -> None:
    groups = [
        (
            "Frameworks & Libraries",
            "orange",
            ["React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "jQuery", "Laravel", "Ruby on Rails", "+ more"],
        ),
        (
            "CMS & E-commerce",
            "peach",
            ["WordPress", "Shopify", "WooCommerce", "Magento", "Drupal", "Joomla", "BigCommerce", "Squarespace", "Webflow", "+ more"],
        ),
        (
            "Analytics & Marketing",
            "mint",
            ["Google Analytics", "Google Tag Manager", "Hotjar", "Facebook Pixel", "HubSpot", "Mailchimp", "Intercom", "Segment", "Klaviyo", "+ more"],
        ),
    ]
    for i, (title, theme, tags) in enumerate(groups):
        group = DetectGroup(title=title, theme=theme, sort_order=i)
        db.add(group)
        db.flush()
        for j, label in enumerate(tags):
            db.add(DetectTag(group_id=group.id, label=label, sort_order=j))


def _seed_site_content(db: Session) -> None:
    if db.query(SiteContent).first():
        if not db.query(DashboardPreview).first():
            _seed_dashboard(db)
        return

    db.add(
        SiteContent(
            brand_name="TechLeads",
            brand_suffix=".Ai",
            logo_text="Ai",
            login_label="Sign In",
            nav_cta_label="Start My Free Trial",
            hero_title="Website Technology Checker for Sales & Agencies",
            hero_subtitle=(
                "Instantly detect what any website is built with — CMS platforms, JavaScript frameworks, "
                "Ecommerce systems, analytics & more. Build targeted lists of sites using specific technologies."
            ),
            hero_search_placeholder="Enter a website URL…",
            hero_search_cta="Analyze",
            hero_secondary_cta="Generate Your First List",
            popular_eyebrow="BROWSE BY STACK",
            popular_title="Popular Technologies",
            features_eyebrow="WHAT TECHLEADS DOES",
            features_title="Everything you need to understand the web",
            detect_eyebrow="DETECTION COVERAGE",
            detect_title="What we detect",
            enrich_eyebrow="BULK LOOKUP",
            enrich_title="Enrich your entire prospect list in seconds",
            enrich_subtitle=(
                "Upload a CSV of domains — TechLeads.Ai detects the tech stack and finds contact emails for every row automatically."
            ),
            enrich_cta="Try Bulk Lookup",
            api_eyebrow="DEVELOPER API",
            api_title="Integrate TechLeads.Ai Into Your Own Stack",
            api_subtitle="The TechLeads.Ai API is live and ready to use. Detect tech stacks programmatically at scale.",
            api_cta="Get API Access",
            api_sample=(
                "$ curl -X POST \\\n"
                "  https://api.techleads.ai/v1/detect \\\n"
                "  -H \"X-API-Key: tl_live_••••••••\" \\\n"
                "  -d '{\"url\": \"shopify.com\"}'\n\n"
                "// 200 OK · 312ms\n"
                "{\n"
                '  "url": "https://shopify.com",\n'
                '  "detected": ["Shopify", "Ruby on Rails", "AWS"],\n'
                '  "emails": ["press@shopify.com"]\n'
                "}"
            ),
            final_cta_title=(
                "Get qualified leads filtered by technology. Access websites using Shopify, React, WordPress, and more."
            ),
            final_cta_primary="Get Started",
            final_cta_secondary="View Pricing",
            pricing_title="Simple, transparent pricing",
            pricing_subtitle=(
                "Choose the plan that fits your needs. Bulk datasets are $29 per technology. "
                "Growth and Business packs add enrichment credits for exports and API use."
            ),
            pricing_yearly_badge="Best value",
            calculator_title="How credits work",
            calculator_subtitle=(
                "1 credit = 1 technology CSV export. Free preview shows 10 records without a filter."
            ),
            calculator_default_leads=500,
            contact_title="Contact sales",
            contact_subtitle="Talk to our team about custom data, API access, or enterprise plans.",
            contact_button_label="Send Message",
            footer_about=(
                "TechLeads.Ai helps sales and agencies detect website technologies, enrich prospect lists, "
                "and generate high-intent leads."
            ),
            footer_copyright="TechLeads.Ai",
            chat_label="Chat with us",
        )
    )
    _seed_dashboard(db)


def _seed_dashboard(db: Session) -> None:
    rows = [
        ("stripe.com", "Payments", "Stripe, React", "US", "2.1M", "Yes"),
        ("shopify.com", "E-commerce", "Shopify, Ruby on Rails", "CA", "1.8M", "Yes"),
        ("hubspot.com", "CRM", "HubSpot, React", "US", "980k", "No"),
        ("vercel.com", "Hosting", "Next.js, React", "US", "740k", "No"),
        ("notion.so", "Productivity", "React, Cloudflare", "US", "620k", "Yes"),
    ]
    for i, (domain, categories, technologies, country, traffic, ads) in enumerate(rows):
        db.add(
            DashboardPreview(
                domain=domain,
                categories=categories,
                technologies=technologies,
                country=country,
                traffic=traffic,
                ads=ads,
                sort_order=i,
            )
        )


def _upsert_category(db: Session, name: str, slug: str, icon: str, order: int) -> Category:
    row = db.query(Category).filter(Category.slug == slug).first()
    if row:
        return row
    row = Category(name=name, slug=slug, icon=icon, item_count=0, sort_order=order)
    db.add(row)
    db.flush()
    return row


def _upsert_technology(
    db: Session,
    name: str,
    slug: str,
    icon: str,
    color: str,
    category: Category,
    order: int,
    popular: bool = False,
) -> Technology:
    row = db.query(Technology).filter(Technology.slug == slug).first()
    if row:
        return row
    row = Technology(
        name=name,
        slug=slug,
        icon=icon,
        icon_color=color,
        website_count=0,
        growth_percent=0.0,
        category_id=category.id,
        is_featured=True,
        is_popular=popular,
        sort_order=order,
    )
    db.add(row)
    db.flush()
    return row


def _sync_websites(db: Session) -> None:
    if db.query(Website).first():
        return

    db.query(WebsiteTechnology).delete()
    db.flush()

    categories = {
        slug: _upsert_category(db, name, slug, icon, order)
        for name, slug, icon, order in [
            ("CMS", "cms", "layout", 0),
            ("Framework", "frameworks", "code", 1),
            ("E-Commerce", "ecommerce", "shopping-bag", 2),
            ("Analytics", "analytics", "bar-chart-3", 3),
            ("Marketing", "marketing", "megaphone", 4),
            ("Payment", "payment", "credit-card", 5),
            ("Hosting", "hosting", "server", 6),
            ("Chat", "chat", "message-circle", 7),
            ("WP Plugin", "wp-plugin", "puzzle", 8),
            ("Review", "review", "star", 9),
            ("Booking", "booking", "calendar", 10),
            ("Business", "business", "briefcase", 11),
            ("Other", "other", "folder", 12),
        ]
    }

    tech_defs = [
        ("WordPress", "wordpress", "layout", "#21759B", "cms", 0, True),
        ("Shopify", "shopify", "shopping-bag", "#96BF48", "ecommerce", 1, True),
        ("Wix", "wix", "layout", "#0C6EFC", "cms", 2, True),
        ("React", "react", "code", "#61DAFB", "frameworks", 3, True),
        ("WooCommerce", "woocommerce", "shopping-cart", "#96588A", "ecommerce", 4, False),
        ("Google Analytics", "google-analytics", "bar-chart-3", "#F9AB00", "analytics", 5, True),
        ("Next.js", "nextjs", "code", "#000000", "frameworks", 6, False),
        ("Stripe", "stripe", "credit-card", "#635BFF", "payment", 7, False),
        ("HubSpot", "hubspot", "users", "#FF7A59", "marketing", 8, False),
        ("Hotjar", "hotjar", "bar-chart-3", "#FD3A64", "analytics", 9, False),
        ("Drupal", "drupal", "layout", "#0678BE", "cms", 10, False),
        ("Magento", "magento", "store", "#F26322", "ecommerce", 11, False),
        ("Klaviyo", "klaviyo", "mail", "#1A1A1A", "marketing", 12, False),
        ("Intercom", "intercom", "message-circle", "#286EFA", "chat", 13, False),
        ("Cloudflare", "cloudflare", "cloud", "#F38020", "hosting", 14, False),
        ("Judge.me", "judge-me", "star", "#2D9CDB", "review", 15, False),
        ("Mailchimp", "mailchimp", "mail", "#FFE01B", "marketing", 16, False),
        ("Squarespace", "squarespace", "layout", "#000000", "cms", 17, False),
        ("Webflow", "webflow", "layout", "#4353FF", "cms", 18, False),
        ("Vue.js", "vuejs", "code", "#42B883", "frameworks", 19, False),
    ]
    tech_map: dict[str, Technology] = {}
    for name, slug, icon, color, cat_slug, order, popular in tech_defs:
        tech_map[slug] = _upsert_technology(
            db, name, slug, icon, color, categories[cat_slug], order, popular
        )

    website_details = {
        "commercialspaceflight.org": {
            "title": "Commercial Space Federation",
            "description": (
                "The Commercial Spaceflight Federation is the leading voice for the commercial space "
                "industry, promoting the development of commercial spaceflight and space exploration."
            ),
            "category_label": "Uncategorized",
            "contact_info": "No contact information available",
            "extra": "Elementor,AstraTheme,YoastSEO,Beaver Builder,Gravity Forms,Cloudflare CDN",
            "facebook": "https://facebook.com",
            "twitter": "https://twitter.com",
            "linkedin": "https://linkedin.com",
        },
    }

    def _title_from_domain(domain: str) -> str:
        base = domain.split(".")[0].replace("-", " ").title()
        return base

    websites = [
        ("commercialspaceflight.org", 91, ["wordpress", "google-analytics", "woocommerce"]),
        ("baboontothemoon.com", 92, ["shopify", "klaviyo"]),
        ("resurgencey.com", 93, ["wordpress", "woocommerce"]),
        ("deskmat.com", 94, ["shopify", "judge-me"]),
        ("philnickphillips.com", 95, ["wordpress", "google-analytics"]),
        ("beadsinbulk.com", 96, ["shopify", "stripe"]),
        ("hrecuisine.com", 97, ["wordpress", "hotjar"]),
        ("healthcheckcommercial.com", 98, ["wordpress", "hubspot"]),
        ("missionrockresidential.com", 99, ["wordpress", "google-analytics"]),
        ("getdesignedoutdoors.com", 100, ["shopify", "klaviyo", "judge-me"]),
        ("stripe.com", 88, ["react", "stripe", "cloudflare"]),
        ("shopify.com", 89, ["shopify", "react"]),
        ("hubspot.com", 90, ["hubspot", "react", "google-analytics"]),
        ("notion.so", 101, ["react", "cloudflare"]),
        ("vercel.com", 102, ["nextjs", "react"]),
        ("allbirds.com", 103, ["shopify", "klaviyo", "google-analytics"]),
        ("gymshark.com", 104, ["shopify", "hotjar"]),
        ("brooklinen.com", 105, ["shopify", "stripe", "judge-me"]),
        ("casper.com", 106, ["shopify", "google-analytics", "mailchimp"]),
        ("warbyparker.com", 107, ["shopify", "react"]),
        ("wixsite-demo.com", 108, ["wix", "google-analytics"]),
        ("drupal-portal.org", 109, ["drupal", "cloudflare"]),
        ("magento-store.net", 110, ["magento", "stripe", "hotjar"]),
        ("webflow-agency.io", 111, ["webflow", "google-analytics", "intercom"]),
        ("squarespace-blog.com", 112, ["squarespace", "mailchimp"]),
    ]

    for i, (domain, rank, tech_slugs) in enumerate(websites):
        detail = website_details.get(domain, {})
        primary_tech = tech_slugs[0] if tech_slugs else ""
        category_label = {
            "wordpress": "CMS",
            "shopify": "E-Commerce",
            "wix": "CMS",
            "drupal": "CMS",
            "magento": "E-Commerce",
            "webflow": "CMS",
            "squarespace": "CMS",
        }.get(primary_tech, "Uncategorized")

        site = Website(
            domain=domain,
            rank=rank,
            sort_order=i,
            title=detail.get("title", _title_from_domain(domain)),
            description=detail.get(
                "description",
                f"Website analysis for {domain}. Technology stack detected by TechLeads.Ai.",
            ),
            category_label=detail.get("category_label", category_label),
            contact_info=detail.get("contact_info", "No contact information available"),
            facebook_url=detail.get("facebook", ""),
            twitter_url=detail.get("twitter", ""),
            linkedin_url=detail.get("linkedin", ""),
            extra_technologies=detail.get(
                "extra",
                "Cloudflare CDN,Google Tag Manager,Open Graph",
            ),
        )
        db.add(site)
        db.flush()
        for slug in tech_slugs:
            tech = tech_map.get(slug)
            if tech:
                db.add(WebsiteTechnology(website_id=site.id, technology_id=tech.id))
