"""Import technologies (and categories) from the public techleads.fyi catalog.

Source: https://techleads.fyi/sitemap-techs-lang.xml (English /technology/{slug} URLs)
and https://techleads.fyi/categories for category slugs.

First run fetches + stores; later runs upsert by slug (no LLM, no API key).
"""

from __future__ import annotations

import hashlib
import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any
from urllib.parse import unquote

import httpx
from sqlalchemy.orm import Session

from app.models import Category, Technology
from app.services.url_utils import slugify

logger = logging.getLogger(__name__)

SITEMAP_INDEX = "https://techleads.fyi/sitemap-techs-lang.xml"
CATEGORIES_URL = "https://techleads.fyi/categories"
TECH_URL_RE = re.compile(
    r"https://techleads\.fyi/technology/([a-zA-Z0-9][a-zA-Z0-9\-\._%~]*)",
    re.IGNORECASE,
)
CATEGORY_URL_RE = re.compile(
    r"/categor(?:y|ies)/([a-z0-9][a-z0-9\-]*)",
    re.IGNORECASE,
)

ICON_COLORS = (
    "#21759B",
    "#96BF48",
    "#61DAFB",
    "#96588A",
    "#635BFF",
    "#FF7A59",
    "#0678BE",
    "#003087",
    "#FD3A64",
    "#F26322",
    "#F9AB00",
    "#FF6B35",
    "#0EA5E9",
    "#10B981",
    "#8B5CF6",
)

NAME_OVERRIDES = {
    "http-3": "HTTP/3",
    "nextjs": "Next.js",
    "nodejs": "Node.js",
    "vuejs": "Vue.js",
    "nuxtjs": "Nuxt.js",
    "wordpress": "WordPress",
    "woocommerce": "WooCommerce",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "jquery": "jQuery",
    "jquery-ui": "jQuery UI",
    "jquery-migrate": "jQuery Migrate",
    "recaptcha": "reCAPTCHA",
    "cloudflare": "Cloudflare",
    "google-analytics": "Google Analytics",
    "google-tag-manager": "Google Tag Manager",
    "google-adsense": "Google AdSense",
    "google-font-api": "Google Font API",
    "office-365-mail": "Office 365 Mail",
    "core-js": "core-js",
    "open-graph": "Open Graph",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "php": "PHP",
    "css": "CSS",
    "html5": "HTML5",
    "aws": "AWS",
    "cdnjs": "cdnjs",
    "jsdelivr": "jsDelivr",
    "hsts": "HSTS",
    "dns": "DNS",
    "cdn": "CDN",
    "rss": "RSS",
    "seo": "SEO",
    "ssl": "SSL",
    "api": "API",
    "ai": "AI",
}

POPULAR_SLUGS = {
    "woocommerce",
    "shopify",
    "whatsapp-business-chat",
    "google-adsense",
    "wix",
    "bluehost",
    "squarespace-commerce",
    "twitter-ads",
    "typescript",
    "klaviyo",
    "vercel",
    "prestashop",
    "magento",
    "opencart",
    "google-analytics",
    "cloudflare",
    "wordpress",
    "react",
    "stripe",
    "hubspot",
}


def _color_for_slug(slug: str) -> str:
    digest = hashlib.md5(slug.encode("utf-8")).hexdigest()
    return ICON_COLORS[int(digest[:8], 16) % len(ICON_COLORS)]


def name_from_slug(slug: str) -> str:
    key = slug.strip().lower()
    if key in NAME_OVERRIDES:
        return NAME_OVERRIDES[key]
    parts = [p for p in key.replace("_", "-").split("-") if p]
    pretty: list[str] = []
    for part in parts:
        if part.isalpha() and len(part) <= 3:
            pretty.append(part.upper())
        else:
            pretty.append(part[:1].upper() + part[1:])
    return " ".join(pretty) or slug


def _http_get(url: str, *, timeout: float = 120.0) -> str:
    headers = {
        "User-Agent": "TechLeads.AiCatalogImporter/1.0 (+https://localhost)",
        "Accept": "*/*",
    }
    with httpx.Client(timeout=timeout, follow_redirects=True, headers=headers) as client:
        res = client.get(url)
        res.raise_for_status()
        return res.text


def fetch_technology_slugs(*, max_workers: int = 8) -> list[str]:
    """Fetch all unique English technology slugs from the public sitemap."""
    index_xml = _http_get(SITEMAP_INDEX, timeout=60.0)
    shard_urls = re.findall(r"<loc>(https://techleads\.fyi/sitemap-techs-lang/[^<]+)</loc>", index_xml)
    if not shard_urls:
        raise RuntimeError("No technology sitemap shards found on techleads.fyi")

    slugs: set[str] = set()

    def _parse_shard(url: str) -> set[str]:
        xml = _http_get(url, timeout=180.0)
        found: set[str] = set()
        for match in TECH_URL_RE.finditer(xml):
            raw = unquote(match.group(1)).strip().strip("/")
            if raw:
                found.add(raw.lower())
        return found

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(_parse_shard, url): url for url in shard_urls}
        done = 0
        for future in as_completed(futures):
            done += 1
            try:
                slugs |= future.result()
            except Exception as exc:
                logger.warning("Failed sitemap shard %s: %s", futures[future], exc)
            if done % 10 == 0 or done == len(futures):
                logger.info("Sitemap shards %s/%s — unique slugs %s", done, len(futures), len(slugs))

    return sorted(slugs)


def fetch_category_slugs() -> list[str]:
    """Fetch category slugs from the public categories browse page."""
    html = _http_get(CATEGORIES_URL, timeout=120.0)
    found = {m.group(1).lower() for m in CATEGORY_URL_RE.finditer(html)}
    # Drop generic path noise
    found.discard("all")
    return sorted(found)


def _ensure_other_category(db: Session) -> Category:
    row = db.query(Category).filter(Category.slug == "other").first()
    if row:
        return row
    row = Category(name="Other", slug="other", icon="folder", item_count=0, sort_order=99)
    db.add(row)
    db.flush()
    return row


def sync_categories_from_techleads(db: Session, category_slugs: list[str] | None = None) -> dict[str, Any]:
    slugs = category_slugs if category_slugs is not None else fetch_category_slugs()
    existing = {c.slug: c for c in db.query(Category).all()}
    created = 0
    updated = 0
    for order, slug in enumerate(slugs):
        name = name_from_slug(slug)
        row = existing.get(slug)
        if row:
            if row.name != name:
                row.name = name
                updated += 1
            continue
        db.add(
            Category(
                name=name,
                slug=slug,
                icon="folder",
                item_count=0,
                sort_order=1000 + order,
            )
        )
        created += 1
    _ensure_other_category(db)
    db.flush()
    return {"categories_seen": len(slugs), "categories_created": created, "categories_updated": updated}


def sync_technologies_from_techleads(
    db: Session,
    *,
    tech_slugs: list[str] | None = None,
    sync_categories: bool = True,
    batch_size: int = 500,
) -> dict[str, Any]:
    """Upsert the full public technology catalog into the local database."""
    stats: dict[str, Any] = {
        "source": SITEMAP_INDEX,
        "technologies_seen": 0,
        "technologies_created": 0,
        "technologies_updated": 0,
        "categories_seen": 0,
        "categories_created": 0,
        "categories_updated": 0,
    }

    if sync_categories:
        cat_stats = sync_categories_from_techleads(db)
        stats.update(cat_stats)

    other = _ensure_other_category(db)
    slugs = tech_slugs if tech_slugs is not None else fetch_technology_slugs()
    stats["technologies_seen"] = len(slugs)

    existing = {t.slug: t for t in db.query(Technology).all()}
    used_names = {t.name.lower() for t in existing.values()}
    seen_slugs = set(existing.keys())
    created = 0
    updated = 0

    for order, slug in enumerate(slugs):
        clean_slug = slugify(slug)[:180]
        name = name_from_slug(slug)
        color = _color_for_slug(slug)
        popular = slug in POPULAR_SLUGS or clean_slug in POPULAR_SLUGS
        row = existing.get(clean_slug)
        if row or clean_slug in seen_slugs:
            if row:
                changed = False
                if not row.name:
                    row.name = name
                    changed = True
                if not row.icon_color:
                    row.icon_color = color
                    changed = True
                if popular and not row.is_popular:
                    row.is_popular = True
                    changed = True
                if changed:
                    updated += 1
            continue

        final_name = name[:160]
        if final_name.lower() in used_names:
            final_name = f"{name} ({clean_slug})"[:160]
        used_names.add(final_name.lower())
        seen_slugs.add(clean_slug)

        db.add(
            Technology(
                name=final_name,
                slug=clean_slug,
                icon="globe",
                icon_color=color,
                website_count=0,
                growth_percent=0.0,
                category_id=other.id,
                is_featured=popular,
                is_popular=popular,
                sort_order=10_000 + order,
            )
        )
        created += 1

        if created % batch_size == 0:
            db.flush()
            logger.info("Inserted %s new technologies…", created)

    db.flush()
    other.item_count = db.query(Technology).filter(Technology.category_id == other.id).count()
    db.commit()

    stats["technologies_created"] = created
    stats["technologies_updated"] = updated
    stats["technologies_total"] = db.query(Technology).count()
    return stats
