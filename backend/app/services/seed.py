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
    FreeTool,
    LegalLink,
    NavItem,
    PlanFeature,
    PricingPlan,
    SiteContent,
    SocialLink,
    Technology,
    TrustLogo,
)


def seed_database(db: Session) -> None:
    _sync_nav(db)
    _seed_core(db)
    _seed_site_content(db)
    _sync_branding(db)
    _sync_social_links(db)
    _sync_footer(db)
    _sync_free_tools(db)
    _sync_blog_posts(db)
    db.commit()


def _sync_nav(db: Session) -> None:
    db.query(NavItem).filter(NavItem.parent_id.isnot(None)).delete()
    db.query(NavItem).delete()
    db.flush()

    free_tools = NavItem(label="Free Tools", href="/tools", has_dropdown=True, sort_order=0)
    db.add(free_tools)
    db.flush()
    for i, (label, href) in enumerate(
        [
            ("Shopify Theme Detector", "/tools/shopify-theme-detector"),
            ("WordPress Theme Detector", "/tools/wordpress-theme-detector"),
            ("CMS Detector", "/tools/cms-detector"),
            ("Shopify App Detector", "/tools/shopify-app-detector"),
        ]
    ):
        db.add(
            NavItem(
                label=label,
                href=href,
                has_dropdown=False,
                parent_id=free_tools.id,
                sort_order=i,
            )
        )

    for i, (label, href) in enumerate(
        [
            ("Blog", "/blog"),
            ("Pricing", "/pricing"),
            ("API Docs", "/api-docs"),
            ("Contact sales", "/contact"),
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
    content.pricing_subtitle = "Start free, then scale as your lead volume grows."
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
            ("API Access", "/api-docs"),
            ("API Docs", "/api-docs"),
            ("Blog", "/blog"),
            ("Sign Up", "/signup"),
        ],
        "Our Tools": [
            ("Website Technology Checker", "/"),
            ("CMS Detector", "/tools/cms-detector"),
            ("Shopify Theme Detector", "/tools/shopify-theme-detector"),
            ("WordPress Theme Detector", "/tools/wordpress-theme-detector"),
            ("Shopify App Detector", "/tools/shopify-app-detector"),
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
            ("Sign In", "/login"),
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


def _sync_free_tools(db: Session) -> None:
    db.query(FreeTool).delete()
    db.flush()
    tools = [
        ("Shopify Theme Detector", "shopify-theme-detector", "Detect the Shopify theme used by any store.", "/tools/shopify-theme-detector"),
        ("WordPress Theme Detector", "wordpress-theme-detector", "Identify WordPress themes on any site.", "/tools/wordpress-theme-detector"),
        ("CMS Detector", "cms-detector", "Find which CMS powers any website.", "/tools/cms-detector"),
        ("Shopify App Detector", "shopify-app-detector", "See apps installed on Shopify stores.", "/tools/shopify-app-detector"),
    ]
    for i, (name, slug, description, href) in enumerate(tools):
        db.add(FreeTool(name=name, slug=slug, description=description, href=href, sort_order=i))


def _sync_blog_posts(db: Session) -> None:
    if db.query(BlogPost).first():
        return
    posts = [
        ("How to find WhatsApp Business websites", "whatsapp-business-websites", "Use technology signals to build high-intent outreach lists.", "Guides"),
        ("Shopify lead generation playbook", "shopify-lead-generation", "Target growing ecommerce brands with the right tech stack filters.", "Playbooks"),
        ("Why tech intelligence beats firmographics alone", "tech-intelligence", "Combine installed tools with company data for better conversion.", "Insights"),
        ("BuiltWith alternative for sales teams", "builtwith-alternative", "How TechLeads.Ai helps agencies move faster than legacy lookalike tools.", "Comparisons"),
    ]
    for i, (title, slug, summary, category) in enumerate(posts):
        db.add(BlogPost(title=title, slug=slug, summary=summary, category=category, sort_order=i))


def _seed_core(db: Session) -> None:
    if db.query(Technology).first():
        if not db.query(DetectGroup).first():
            _seed_detect_groups(db)
        if db.query(FeatureHighlight).count() < 4:
            db.query(FeatureHighlight).delete()
            _seed_features(db)
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

    plans = [
        {
            "name": "Free",
            "slug": "free",
            "description": "Try TechLeads.Ai with limited lookups.",
            "monthly_price": 0,
            "yearly_price": 0,
            "credits": 50,
            "is_popular": False,
            "cta_label": "Start Free",
            "features": ["50 lookups / month", "Free tools access", "CSV export (limited)", "Email support"],
        },
        {
            "name": "Pro",
            "slug": "pro",
            "description": "For growing sales and agency teams.",
            "monthly_price": 59,
            "yearly_price": 588,
            "credits": 10000,
            "is_popular": True,
            "cta_label": "Start Trial",
            "features": [
                "10,000 lookups / month",
                "Bulk CSV enrichment",
                "Lead lists & filters",
                "Chrome extension",
                "Priority support",
            ],
        },
        {
            "name": "Enterprise",
            "slug": "enterprise",
            "description": "Custom data, API volume, and dedicated support.",
            "monthly_price": 149,
            "yearly_price": 1428,
            "credits": 100000,
            "is_popular": False,
            "cta_label": "Contact Sales",
            "features": [
                "100,000+ lookups / month",
                "API access",
                "Custom datasets",
                "Team seats",
                "SSO & audit logs",
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

    _seed_features(db)
    _seed_detect_groups(db)
    for i, name in enumerate(["G2", "Capterra", "Trustpilot", "Product Hunt"]):
        db.add(TrustLogo(name=name, sort_order=i))


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
            pricing_subtitle="Start free, then scale as your lead volume grows.",
            pricing_yearly_badge="Save 20%",
            calculator_title="How much data do you need?",
            calculator_subtitle="Drag the slider to estimate pricing for your lead volume.",
            calculator_default_leads=10000,
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
