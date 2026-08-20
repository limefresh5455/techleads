"""CLI: import all technologies from https://techleads.fyi into the local DB.

Usage (from backend/):
  .\\.venv\\Scripts\\python.exe -m app.scripts.import_techleads_technologies
  .\\.venv\\Scripts\\python.exe -m app.scripts.import_techleads_technologies --refresh
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from app.core.database import Base, SessionLocal, engine
from app.services.import_techleads_catalog import (
    fetch_technology_slugs,
    sync_technologies_from_techleads,
)
from app.services.migrate import migrate_user_columns, migrate_website_columns
import app.models  # noqa: F401

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("import_techleads_technologies")

CACHE_FILE = Path(__file__).resolve().parents[2] / "data" / "techleads_technology_slugs.txt"


def _load_cached_slugs() -> list[str] | None:
    if not CACHE_FILE.exists():
        return None
    lines = [
        line.strip()
        for line in CACHE_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    return lines or None


def _save_cached_slugs(slugs: list[str]) -> None:
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text("\n".join(slugs) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import technologies from techleads.fyi")
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Re-download the public sitemap instead of using the local cache file",
    )
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    migrate_website_columns()
    migrate_user_columns()

    db = SessionLocal()
    try:
        slugs = None if args.refresh else _load_cached_slugs()
        if slugs:
            logger.info("Using cached slug list (%s) from %s", len(slugs), CACHE_FILE)
        else:
            logger.info("Downloading technology sitemap from techleads.fyi …")
            slugs = fetch_technology_slugs()
            _save_cached_slugs(slugs)
            logger.info("Cached %s slugs to %s", len(slugs), CACHE_FILE)

        logger.info("Upserting technologies into the database …")
        stats = sync_technologies_from_techleads(db, tech_slugs=slugs)
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
