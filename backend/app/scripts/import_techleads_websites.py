"""CLI: import public sample websites from techleads.fyi technology pages.

Usage (from backend/):
  .\\.venv\\Scripts\\python.exe -m app.scripts.import_techleads_websites
  .\\.venv\\Scripts\\python.exe -m app.scripts.import_techleads_websites --limit-techs 50
  .\\.venv\\Scripts\\python.exe -m app.scripts.import_techleads_websites --popular-only
  .\\.venv\\Scripts\\python.exe -m app.scripts.import_techleads_websites --all

Note: Full website lists are not public. This stores sample domains shown on
each https://techleads.fyi/technology/{slug} page, plus website_count.
"""

from __future__ import annotations

import argparse
import logging
import sys

from app.core.database import Base, SessionLocal, engine
from app.services.import_techleads_websites import sync_websites_from_techleads
from app.services.migrate import migrate_user_columns, migrate_website_columns
import app.models  # noqa: F401

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("import_techleads_websites")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import sample websites from techleads.fyi")
    parser.add_argument("--limit-techs", type=int, default=100, help="Max technologies to scrape (default 100)")
    parser.add_argument("--all", action="store_true", help="Scrape every technology in the local DB (slow)")
    parser.add_argument("--popular-only", action="store_true", help="Only popular technologies")
    parser.add_argument("--workers", type=int, default=6, help="Parallel page fetch workers")
    parser.add_argument("--slugs", type=str, default="", help="Comma-separated technology slugs")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    migrate_website_columns()
    migrate_user_columns()

    slugs = [s.strip() for s in args.slugs.split(",") if s.strip()] or None
    limit = None if args.all else args.limit_techs

    db = SessionLocal()
    try:
        logger.info(
            "Importing sample websites from techleads.fyi (limit_techs=%s popular_only=%s) …",
            limit,
            args.popular_only,
        )
        stats = sync_websites_from_techleads(
            db,
            tech_slugs=slugs,
            limit_techs=limit,
            max_workers=max(1, args.workers),
            popular_only=args.popular_only,
        )
        logger.info("Done: %s", stats)
        print(stats)
        return 0
    except Exception as exc:
        logger.exception("Import failed: %s", exc)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
