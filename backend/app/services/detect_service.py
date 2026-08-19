import json
import time
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Category, Technology, Website, WebsiteTechnology
from app.services.crawler import crawl_url
from app.services.gemini_enrichment import enrich_with_gemini
from app.services.signals import extract_signals, signals_to_json
from app.services.url_utils import extract_domain, normalize_url, slugify

TECH_COLORS = {
    "wordpress": "#21759B",
    "shopify": "#96BF48",
    "react": "#61DAFB",
    "google-analytics": "#F9AB00",
    "woocommerce": "#96588A",
}


def detect_and_store(db: Session, raw_url: str) -> Website:
    started = time.perf_counter()
    url = normalize_url(raw_url)
    domain = extract_domain(url)

    crawl = crawl_url(url)
    signals = extract_signals(crawl.html, crawl.headers, crawl.final_url)
    signals["final_url"] = crawl.final_url
    enriched = enrich_with_gemini(domain, signals)

    website = db.query(Website).filter(Website.domain == domain).first()
    if not website:
        website = Website(domain=domain)
        db.add(website)

    website.source_url = crawl.final_url
    website.title = enriched["title"]
    website.description = enriched["description"]
    website.category_label = enriched["category_label"]
    website.contact_info = enriched["contact_info"]
    website.facebook_url = enriched.get("facebook_url", "")
    website.twitter_url = enriched.get("twitter_url", "")
    website.linkedin_url = enriched.get("linkedin_url", "")
    extras = list(
        dict.fromkeys(
            (enriched.get("extra_technologies") or [])
            + (enriched.get("marketing_stack") or [])
            + (enriched.get("analytics_tools") or [])
            + (enriched.get("payment_providers") or [])
        )
    )
    website.extra_technologies = ", ".join(extras)
    website.rank = max(1, min(100, int(enriched.get("rank", 75))))
    website.signals_json = signals_to_json(signals)
    website.enriched_json = json.dumps(enriched, ensure_ascii=False)
    website.last_crawled_at = datetime.now(timezone.utc)
    db.flush()

    db.query(WebsiteTechnology).filter(WebsiteTechnology.website_id == website.id).delete()

    tech_names = list(
        dict.fromkeys(
            (enriched.get("technologies") or [])
            + signals.get("rule_based_technologies", [])
        )
    )
    for order, name in enumerate(tech_names):
        tech = _get_or_create_technology(db, name, order)
        db.add(WebsiteTechnology(website_id=website.id, technology_id=tech.id))

    db.commit()
    db.refresh(website)
    website._crawl_ms = int((time.perf_counter() - started) * 1000)  # type: ignore[attr-defined]
    return website


def refresh_website(db: Session, website: Website) -> Website:
    url = website.source_url or f"https://{website.domain}"
    return detect_and_store(db, url)


def _get_or_create_technology(db: Session, name: str, order: int) -> Technology:
    clean = name.strip()
    slug = slugify(clean)
    row = db.query(Technology).filter((Technology.slug == slug) | (Technology.name == clean)).first()
    if row:
        return row

    category = db.query(Category).filter(Category.slug == "other").first()
    if not category:
        category = Category(name="Other", slug="other", icon="folder", sort_order=99)
        db.add(category)
        db.flush()
    if not category:
        category = db.query(Category).order_by(Category.sort_order).first()

    row = Technology(
        name=clean,
        slug=slug,
        icon="globe",
        icon_color=TECH_COLORS.get(slug, "#FF6B35"),
        website_count=1,
        category_id=category.id if category else None,
        is_featured=True,
        is_popular=False,
        sort_order=1000 + order,
    )
    db.add(row)
    db.flush()
    return row
