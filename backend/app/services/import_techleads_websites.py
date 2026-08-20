"""Import public sample websites from techleads.fyi technology pages.

Full lead lists (millions per tech, 450M+ total) require a paid TechLeads API /
bulk dataset. Public /technology/{slug} pages only expose a small sample plus
the total website count — those are what this importer stores.
"""

from __future__ import annotations

import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any
from urllib.parse import unquote

import httpx
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Technology, Website, WebsiteTechnology

logger = logging.getLogger(__name__)

TECH_PAGE = "https://techleads.fyi/technology/{slug}"
FAVICON_DOMAIN_RE = re.compile(
    r"google\.com/s2/favicons\?domain=([^&\"'\s]+)",
    re.IGNORECASE,
)
LOOKUP_DOMAIN_RE = re.compile(
    r"/lookup/([a-z0-9][a-z0-9\.-]+\.[a-z]{2,})",
    re.IGNORECASE,
)
WEBSITE_COUNT_RE = re.compile(
    r"(?:Dataset scale:\s*about\s*|Find all\s*|)([\d,]+)\s*websites",
    re.IGNORECASE,
)
COUNT_FALLBACK_RE = re.compile(r"([\d,]{3,})\s*websites", re.IGNORECASE)


def _http_get(url: str, *, timeout: float = 60.0) -> str:
    headers = {
        "User-Agent": "TechLeads.AiCatalogImporter/1.0 (+https://localhost)",
        "Accept": "text/html,application/xhtml+xml",
    }
    with httpx.Client(timeout=timeout, follow_redirects=True, headers=headers) as client:
        res = client.get(url)
        res.raise_for_status()
        return res.text


def _parse_count(html: str) -> int:
    for pattern in (WEBSITE_COUNT_RE, COUNT_FALLBACK_RE):
        match = pattern.search(html)
        if not match:
            continue
        try:
            return int(match.group(1).replace(",", ""))
        except ValueError:
            continue
    return 0


def _parse_sample_domains(html: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for pattern in (FAVICON_DOMAIN_RE, LOOKUP_DOMAIN_RE):
        for match in pattern.finditer(html):
            domain = unquote(match.group(1)).strip().lower()
            domain = domain.removeprefix("www.")
            if not domain or "." not in domain or domain in seen:
                continue
            if domain.endswith(("googletagmanager.com", "google.com", "gstatic.com")):
                continue
            seen.add(domain)
            found.append(domain)
    return found


def fetch_technology_page(slug: str) -> dict[str, Any]:
    html = _http_get(TECH_PAGE.format(slug=slug))
    return {
        "slug": slug,
        "website_count": _parse_count(html),
        "domains": _parse_sample_domains(html),
    }


def _upsert_website(db: Session, domain: str, *, rank: int, sort_order: int) -> Website:
    row = db.query(Website).filter(Website.domain == domain).first()
    if row:
        if not row.rank:
            row.rank = rank
        return row
    row = Website(
        domain=domain,
        rank=rank,
        sort_order=sort_order,
        title=domain,
        description=f"Website listed under technology detection catalog for {domain}.",
        category_label="Uncategorized",
        contact_info="No contact information available",
        source_url=f"https://{domain}",
    )
    db.add(row)
    db.flush()
    return row


def _link_tech(db: Session, website_id: int, technology_id: int) -> bool:
    exists = (
        db.query(WebsiteTechnology)
        .filter(
            WebsiteTechnology.website_id == website_id,
            WebsiteTechnology.technology_id == technology_id,
        )
        .first()
    )
    if exists:
        return False
    db.add(WebsiteTechnology(website_id=website_id, technology_id=technology_id))
    return True


def _store_page_result(db: Session, tech: Technology, payload: dict[str, Any]) -> dict[str, int]:
    created_sites = 0
    linked = 0
    if payload.get("website_count"):
        tech.website_count = int(payload["website_count"])

    domains = payload.get("domains") or []
    for index, domain in enumerate(domains):
        before = db.query(Website).filter(Website.domain == domain).first()
        site = _upsert_website(
            db,
            domain,
            rank=max(1, min(100, 40 + (index % 50))),
            sort_order=10_000 + (tech.id * 100) + index,
        )
        if before is None:
            created_sites += 1
        if _link_tech(db, site.id, tech.id):
            linked += 1
    return {"websites_created": created_sites, "links_created": linked, "samples": len(domains)}


def sync_websites_from_techleads(
    db: Session,
    *,
    tech_slugs: list[str] | None = None,
    limit_techs: int | None = 100,
    max_workers: int = 6,
    popular_only: bool = False,
) -> dict[str, Any]:
    """Scrape public technology pages and store sample websites + counts."""
    query = db.query(Technology)
    if tech_slugs:
        query = query.filter(Technology.slug.in_(tech_slugs))
    elif popular_only:
        query = query.filter(Technology.is_popular.is_(True))
    techs = (
        query.order_by(Technology.website_count.desc(), Technology.sort_order.asc()).all()
    )
    if limit_techs is not None:
        techs = techs[: max(0, limit_techs)]

    stats = {
        "source": "https://techleads.fyi/technology/{slug}",
        "technologies_targeted": len(techs),
        "technologies_scraped": 0,
        "technologies_failed": 0,
        "websites_created": 0,
        "links_created": 0,
        "samples_seen": 0,
        "note": (
            "Only public sample domains per technology page are available without a "
            "TechLeads API key / paid dataset. Full lists are not publicly downloadable."
        ),
    }
    if not techs:
        return stats

    tech_by_slug = {t.slug: t for t in techs}
    results: dict[str, dict[str, Any]] = {}

    def _job(slug: str) -> tuple[str, dict[str, Any] | None, str | None]:
        try:
            return slug, fetch_technology_page(slug), None
        except Exception as exc:  # noqa: BLE001
            return slug, None, str(exc)

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = [pool.submit(_job, t.slug) for t in techs]
        done = 0
        for future in as_completed(futures):
            slug, payload, error = future.result()
            done += 1
            if error or not payload:
                stats["technologies_failed"] += 1
                logger.warning("Failed %s: %s", slug, error)
            else:
                results[slug] = payload
                stats["technologies_scraped"] += 1
            if done % 25 == 0 or done == len(futures):
                logger.info("Scraped technology pages %s/%s", done, len(futures))

    # Persist in the caller's session (single-threaded writes)
    for slug, payload in results.items():
        tech = tech_by_slug.get(slug)
        if not tech:
            continue
        # refresh detached-safe
        tech = db.query(Technology).filter(Technology.id == tech.id).first()
        if not tech:
            continue
        part = _store_page_result(db, tech, payload)
        stats["websites_created"] += part["websites_created"]
        stats["links_created"] += part["links_created"]
        stats["samples_seen"] += part["samples"]

    db.commit()
    stats["websites_total"] = db.query(Website).count()
    return stats


def sync_websites_worker_safe(
    *,
    tech_slugs: list[str] | None = None,
    limit_techs: int | None = 100,
    max_workers: int = 6,
    popular_only: bool = False,
) -> dict[str, Any]:
    """Convenience wrapper with its own DB session."""
    db = SessionLocal()
    try:
        return sync_websites_from_techleads(
            db,
            tech_slugs=tech_slugs,
            limit_techs=limit_techs,
            max_workers=max_workers,
            popular_only=popular_only,
        )
    finally:
        db.close()
