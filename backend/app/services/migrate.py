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
