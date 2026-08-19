from sqlalchemy import inspect, text

from app.core.database import engine


def migrate_website_columns() -> None:
    inspector = inspect(engine)
    if "websites" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("websites")}
    additions = {
        "source_url": "VARCHAR(255) DEFAULT ''",
        "signals_json": "TEXT DEFAULT ''",
        "enriched_json": "TEXT DEFAULT ''",
        "last_crawled_at": "TIMESTAMP WITH TIME ZONE",
        "instagram_url": "VARCHAR(255) DEFAULT ''",
        "youtube_url": "VARCHAR(255) DEFAULT ''",
        "industry": "VARCHAR(120) DEFAULT ''",
        "company_type": "VARCHAR(80) DEFAULT ''",
        "business_summary": "TEXT DEFAULT ''",
        "marketing_stack": "TEXT DEFAULT ''",
        "analytics_tools": "TEXT DEFAULT ''",
        "payment_providers": "TEXT DEFAULT ''",
        "cms_platform": "VARCHAR(120) DEFAULT ''",
        "ecommerce_platform": "VARCHAR(120) DEFAULT ''",
        "hosting_cdn": "VARCHAR(120) DEFAULT ''",
        "key_features": "TEXT DEFAULT ''",
        "target_audience": "VARCHAR(300) DEFAULT ''",
        "phone": "VARCHAR(80) DEFAULT ''",
        "address": "VARCHAR(300) DEFAULT ''",
        "estimated_traffic_tier": "VARCHAR(40) DEFAULT ''",
        "confidence_score": "INTEGER DEFAULT 0",
        "llm_insights": "TEXT DEFAULT ''",
        "llm_used": "BOOLEAN DEFAULT FALSE",
        "llm_error": "TEXT DEFAULT ''",
        "llm_provider": "VARCHAR(40) DEFAULT ''",
        "llm_model": "VARCHAR(120) DEFAULT ''",
    }

    with engine.begin() as conn:
        for name, ddl in additions.items():
            if name not in existing:
                conn.execute(text(f"ALTER TABLE websites ADD COLUMN {name} {ddl}"))


def migrate_user_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("users")}
    with engine.begin() as conn:
        if "credits" not in existing:
            conn.execute(text("ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0"))
