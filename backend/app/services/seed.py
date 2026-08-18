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
    ToolFaq,
    ToolFeature,
    ToolPopularItem,
    TrustLogo,
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
    _sync_free_tools(db)
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

    free_tools = NavItem(label="Free Tools", href="/tools", has_dropdown=True, sort_order=0)
    db.add(free_tools)
    db.flush()
    for i, (label, href) in enumerate(
        [
            ("Shopify Theme Detector", "/shopify-theme-detector"),
            ("WordPress Theme Detector", "/wordpress-theme-detector"),
            ("CMS Detector", "/cms-detector"),
            ("Shopify App Detector", "/shopify-app-detector"),
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
            ("Custom Data", "/custom-data"),
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
    content.pricing_title = "Plans & pricing"
    content.pricing_subtitle = (
        "Choose a plan that gives you technology lists, lead generation tools, and website insights. "
        "All plans include access to our technology detection database."
    )
    content.pricing_yearly_badge = "Save ~17%"
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
            ("Custom Data", "/custom-data"),
            ("API Docs", "/api-docs"),
            ("Blog", "/blog"),
            ("Sign Up", "/signup"),
        ],
        "Our Tools": [
            ("Website Technology Checker", "/"),
            ("CMS Detector", "/cms-detector"),
            ("Shopify Theme Detector", "/shopify-theme-detector"),
            ("WordPress Theme Detector", "/wordpress-theme-detector"),
            ("Shopify App Detector", "/shopify-app-detector"),
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


def _sync_free_tools(db: Session) -> None:
    db.query(ToolFaq).delete()
    db.query(ToolFeature).delete()
    db.query(ToolPopularItem).delete()
    db.query(FreeTool).delete()
    db.flush()

    tools = [
        {
            "name": "Shopify Theme Detector",
            "slug": "shopify-theme-detector",
            "description": "Analyze any Shopify store to discover its theme, features, and installed applications",
            "href": "/shopify-theme-detector",
            "cta_label": "Detect Theme",
            "popular_title": "Popular Shopify Themes",
            "popular_subtitle": "Explore the most popular themes powering successful Shopify stores",
            "features_title": "Powerful Features",
            "features_subtitle": "Everything you need to analyze and understand any Shopify store's technology stack",
            "faq_title": "Frequently Asked Questions",
            "faq_subtitle": "Everything you need to know about our Shopify Theme Detector",
            "final_cta_title": "Discover Your Website's Full Technology Stack",
            "final_cta_subtitle": "Analyze themes, apps, widgets, and more with our complete tech scanner",
            "final_cta_label": "Scan Your Website Now",
            "popular": [
                (
                    "Dawn",
                    "Shopify's default theme, optimized for speed and modern commerce. Perfect for large catalogs and multimedia-rich stores.",
                ),
                (
                    "Debut",
                    "Classic, versatile theme with powerful customization options. Ideal for both small and large product catalogs.",
                ),
                (
                    "Expanse",
                    "Modern, minimalist design with focus on visual storytelling. Great for fashion, beauty, and lifestyle brands.",
                ),
                (
                    "Motion",
                    "Premium theme with advanced animations and transitions. Perfect for creating engaging shopping experiences.",
                ),
                (
                    "Sense",
                    "Elegant theme with advanced product filtering and search capabilities. Ideal for large inventories and multi-category stores.",
                ),
                (
                    "Headless",
                    "Custom headless Shopify implementations using modern frameworks like Next.js, offering maximum flexibility and performance.",
                ),
            ],
            "features": [
                (
                    "Theme Detection",
                    "Identify themes, including custom and premium ones with high accuracy",
                ),
                (
                    "Feature Detection",
                    "Analyze key features and functionality in real-time",
                ),
                (
                    "Real-time Results",
                    "Get instant analysis with detailed breakdown reports",
                ),
            ],
            "faqs": [
                (
                    "What is a Shopify Theme Detector?",
                    "A Shopify Theme Detector is a tool that analyzes Shopify stores to identify their theme, installed applications, and key features. It helps developers, marketers, and store owners understand the technology stack behind any Shopify store.",
                ),
                (
                    "How accurate is the theme detection?",
                    "Our tool uses advanced pattern matching and signature detection to identify themes with high accuracy. However, custom themes or heavily modified default themes may be reported as 'Custom Theme'.",
                ),
                (
                    "What features can be detected?",
                    "We can detect various features including product reviews, wishlist functionality, newsletter popups, currency converters, search autocomplete, and live chat implementations.",
                ),
                (
                    "Is it free to use?",
                    "Yes, the Shopify Theme Detector is completely free to use. You can analyze any number of Shopify stores without any cost.",
                ),
            ],
        },
        {
            "name": "WordPress Theme Detector",
            "slug": "wordpress-theme-detector",
            "description": "Analyze any WordPress website to discover its theme, plugins, and customizations",
            "href": "/wordpress-theme-detector",
            "cta_label": "Analyze Site",
            "popular_title": "Popular WordPress Themes",
            "popular_subtitle": "Discover the most widely-used WordPress themes and their features",
            "features_title": "Key Features",
            "features_subtitle": "Everything you need to analyze and understand WordPress websites",
            "faq_title": "Frequently Asked Questions",
            "faq_subtitle": "Common questions about our WordPress Theme Detector",
            "final_cta_title": "Reveal the Hidden Technology Stack Powering Any Site",
            "final_cta_subtitle": "Detect WordPress themes, plugins, features and more with our complete tech scanner",
            "final_cta_label": "Find out what powers your site",
            "popular": [
                (
                    "Divi",
                    "A versatile theme with a powerful visual builder, perfect for creating custom designs without coding.",
                ),
                (
                    "Astra",
                    "Lightweight and fast-loading theme with extensive customization options and starter templates.",
                ),
                (
                    "GeneratePress",
                    "Performance focused theme with clean code and excellent compatibility with page builders and plugins.",
                ),
                (
                    "OceanWP",
                    "Feature-rich theme with deep WooCommerce integration and extensive customization options.",
                ),
                (
                    "Kadence",
                    "Modern theme with advanced header builder and performance optimization features.",
                ),
                (
                    "Blocksy",
                    "Next-generation theme built for the WordPress block editor with extensive customization options.",
                ),
            ],
            "features": [
                (
                    "Theme Detection",
                    "Identify WordPress themes and child themes with high accuracy",
                ),
                (
                    "Plugin Analysis",
                    "Discover active plugins and their versions",
                ),
                (
                    "Feature Detection",
                    "Identify key WordPress features and customizations",
                ),
                (
                    "Security Check",
                    "Detect security plugins and common protection measures",
                ),
            ],
            "faqs": [
                (
                    "What is a WordPress Theme Detector?",
                    "A WordPress Theme Detector is a tool that analyzes WordPress websites to identify their themes, active plugins, and customizations. It helps developers and site owners understand the technology behind any WordPress website.",
                ),
                (
                    "Can it detect custom themes?",
                    "Yes, our tool can detect custom themes and will provide information about their structure and features. However, for heavily customized themes, some details may be limited.",
                ),
                (
                    "What information can be detected?",
                    "Our tool can detect theme names, versions, active plugins, custom post types, widgets, and various WordPress features including security measures and optimization tools.",
                ),
                (
                    "Is it free to use?",
                    "Yes, the WordPress Theme Detector is completely free to use. You can analyze any number of WordPress websites without any cost.",
                ),
            ],
        },
        {
            "name": "CMS Detector",
            "slug": "cms-detector",
            "description": "Instantly discover any website's CMS platform, plugins, themes, and integrations",
            "href": "/cms-detector",
            "cta_label": "Detect CMS",
            "popular_title": "Popular CMS Platforms",
            "popular_subtitle": "Discover the different types of Content Management Systems",
            "features_title": "Key Features",
            "features_subtitle": "Everything you need to analyze and understand any website's CMS platform",
            "faq_title": "Frequently Asked Questions",
            "faq_subtitle": "Common questions about our CMS Detection tool",
            "final_cta_title": "Discover Your Website's Full Technology Stack",
            "final_cta_subtitle": "Check and analyze CMS platforms, plugins, integrations and more with our complete tech detector & scanner",
            "final_cta_label": "Scan Your Website Now",
            "popular": [
                (
                    "WordPress",
                    "The world's most popular CMS, perfect for blogs, business sites, and portfolios. Known for its extensive plugin ecosystem.",
                ),
                (
                    "Shopify",
                    "Popular ecommerce platform designed for businesses of all sizes. Easily build, customize, and manage your online store with powerful tools and integrations.",
                ),
                (
                    "Drupal",
                    "Highly flexible and secure CMS favored by large organizations and government websites. Excellent for complex content structures.",
                ),
                (
                    "Wix",
                    "A website builder for creating beautiful websites quickly. Ideal for small businesses, portfolios, and personal projects with drag-and-drop simplicity.",
                ),
                (
                    "Ghost",
                    "Modern publishing platform built for professional bloggers and content creators. Features a clean, minimalist interface.",
                ),
                (
                    "Headless CMS",
                    "Modern content management systems that separate content from presentation, ideal for multi-platform content delivery.",
                ),
            ],
            "features": [
                (
                    "CMS Detection",
                    "Identify content management systems with high accuracy",
                ),
                (
                    "Feature Analysis",
                    "Discover installed plugins and core features",
                ),
                (
                    "Theme Detection",
                    "Identify themes and templates being used",
                ),
                (
                    "Real-time Analysis",
                    "Get instant results with detailed breakdown",
                ),
            ],
            "faqs": [
                (
                    "What is a CMS Detector & Checker?",
                    "A CMS Detector & Checker is a tool that analyzes and checks websites to identify their content management system, installed plugins, and key features.",
                ),
                (
                    "Which CMS platforms can be detected?",
                    "Our tool can detect major CMS platforms including WordPress, Drupal, Joomla, Ghost, and Magento, along with their associated features and plugins.",
                ),
                (
                    "How accurate is our CMS checker?",
                    "Our tool uses advanced pattern matching and signature detection to check and identify CMS platforms with high accuracy. However, heavily customized installations may affect detection accuracy.",
                ),
                (
                    "Is it free to use?",
                    "Yes, the CMS Detector is completely free to use.",
                ),
            ],
        },
        {
            "name": "Shopify App Detector",
            "slug": "shopify-app-detector",
            "description": "Analyze any Shopify store to discover installed apps, widgets, and ecommerce integrations",
            "href": "/shopify-app-detector",
            "cta_label": "Detect Apps",
            "popular_title": "Popular Shopify Apps",
            "popular_subtitle": "Explore apps commonly found on high-performing Shopify stores",
            "features_title": "Powerful Features",
            "features_subtitle": "Everything you need to uncover a Shopify store's app stack",
            "faq_title": "Frequently Asked Questions",
            "faq_subtitle": "Everything you need to know about our Shopify App Detector",
            "final_cta_title": "Uncover Every App Powering a Shopify Store",
            "final_cta_subtitle": "Detect themes, apps, widgets, and more with our complete tech scanner",
            "final_cta_label": "Scan Your Website Now",
            "popular": [
                (
                    "Klaviyo",
                    "Email and SMS marketing platform used by ecommerce brands for automated flows and campaigns.",
                ),
                (
                    "Judge.me",
                    "Product reviews app that helps stores collect social proof and display ratings on product pages.",
                ),
                (
                    "Recharge",
                    "Subscription management app for recurring products and membership-style shopping experiences.",
                ),
                (
                    "Gorgias",
                    "Helpdesk and live chat platform built for Shopify support teams.",
                ),
                (
                    "Privy",
                    "Popups, banners, and email capture tools for converting visitors into customers.",
                ),
                (
                    "Shopify Flow",
                    "Automation toolkit for streamlining store operations without custom code.",
                ),
            ],
            "features": [
                (
                    "App Detection",
                    "Identify installed Shopify apps and common third-party widgets",
                ),
                (
                    "Integration Analysis",
                    "Spot marketing, reviews, chat, and subscription tools in use",
                ),
                (
                    "Real-time Results",
                    "Get instant analysis with a clear breakdown of detected apps",
                ),
            ],
            "faqs": [
                (
                    "What is a Shopify App Detector?",
                    "A Shopify App Detector analyzes Shopify stores to identify installed applications, widgets, and common ecommerce integrations.",
                ),
                (
                    "How accurate is app detection?",
                    "We use signature and pattern matching across scripts, markup, and known app footprints. Heavily customized or privately hosted apps may be harder to detect.",
                ),
                (
                    "Is it free to use?",
                    "Yes, the Shopify App Detector is free to use for website analysis.",
                ),
            ],
        },
    ]

    for i, tool in enumerate(tools):
        row = FreeTool(
            name=tool["name"],
            slug=tool["slug"],
            description=tool["description"],
            href=tool["href"],
            cta_label=tool["cta_label"],
            popular_title=tool["popular_title"],
            popular_subtitle=tool["popular_subtitle"],
            features_title=tool["features_title"],
            features_subtitle=tool["features_subtitle"],
            faq_title=tool["faq_title"],
            faq_subtitle=tool["faq_subtitle"],
            final_cta_title=tool["final_cta_title"],
            final_cta_subtitle=tool["final_cta_subtitle"],
            final_cta_label=tool["final_cta_label"],
            sort_order=i,
        )
        db.add(row)
        db.flush()
        for j, (title, description) in enumerate(tool["popular"]):
            db.add(
                ToolPopularItem(
                    tool_id=row.id, title=title, description=description, sort_order=j
                )
            )
        for j, (title, description) in enumerate(tool["features"]):
            db.add(
                ToolFeature(
                    tool_id=row.id, title=title, description=description, sort_order=j
                )
            )
        for j, (question, answer) in enumerate(tool["faqs"]):
            db.add(
                ToolFaq(tool_id=row.id, question=question, answer=answer, sort_order=j)
            )


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
            "What’s included in the data exports?",
            "Our data exports provide detailed technology insights based on what we can detect from each website. This typically includes frameworks, CMS platforms, analytics tools, and other technologies in use.",
        ),
        (
            "Can I filter data by specific technologies?",
            "Absolutely! All plans allow filtering by technology type.",
        ),
        (
            "Can I upgrade or downgrade my plan?",
            "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will be applied at the start of your next billing cycle.",
        ),
        (
            "Do you offer custom data solutions?",
            "Yes, our Enterprise plan can be customized to meet your specific needs. Contact our sales team to discuss custom data fields, integration options, or specialized industry coverage.",
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
            "name": "Starter",
            "slug": "starter",
            "description": "Perfect for individuals and small teams",
            "monthly_price": 99,
            "yearly_price": 980,
            "credits": 0,
            "is_popular": False,
            "cta_label": "Get started",
            "features": [
                "Unlimited technology lists",
                "Unlimited keyword searches",
                "Unlimited leads per export",
                "1 team member access",
                "Advanced filtering",
                "Priority email support",
            ],
        },
        {
            "name": "Business",
            "slug": "business",
            "description": "Ideal for growing businesses and marketing teams",
            "monthly_price": 149,
            "yearly_price": 1480,
            "credits": 25000,
            "is_popular": True,
            "cta_label": "Get started",
            "features": [
                "Unlimited technology lists",
                "Unlimited keyword searches",
                "Unlimited leads per export",
                "1 team member access",
                "Advanced filtering",
                "Bulk lookup",
                "API access (25k requests/mo)",
                "Priority email support",
            ],
        },
        {
            "name": "Enterprise",
            "slug": "enterprise",
            "description": "For teams and organizations with advanced needs",
            "monthly_price": 0,
            "yearly_price": 0,
            "credits": 0,
            "is_popular": False,
            "cta_label": "Contact Sales",
            "features": [
                "Unlimited technology lists",
                "Unlimited keyword searches",
                "Bulk data purchase",
                "Multiple team members access",
                "Advanced filtering",
                "API access",
                "Dedicated account manager",
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
    db.query(WebsiteTechnology).delete()
    db.query(Website).delete()
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

    websites = [
        ("commercialspaceflight.org", 91, ["wordpress", "google-analytics"]),
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
        site = Website(domain=domain, rank=rank, sort_order=i)
        db.add(site)
        db.flush()
        for slug in tech_slugs:
            tech = tech_map.get(slug)
            if tech:
                db.add(WebsiteTechnology(website_id=site.id, technology_id=tech.id))
