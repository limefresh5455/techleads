import json
import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models import Category, Technology, Website, WebsiteTechnology
from app.services.crawler import crawl_url
from app.services.llm_enrichment import enrich_with_llm
from app.services.signals import extract_signals, signals_to_json
from app.services.techleads_api import lookup_website, merge_lookup_into_signals, tech_names_from_lookup
from app.services.url_utils import extract_domain, normalize_url, slugify

TECH_COLORS = {
    "wordpress": "#21759B",
    "shopify": "#96BF48",
    "react": "#61DAFB",
    "google-analytics": "#F9AB00",
    "woocommerce": "#96588A",
}


def detect_and_store(db: Session, raw_url: str, *, use_techleads_api: bool | None = None) -> Website:
    started = time.perf_counter()
    url = normalize_url(raw_url)
    domain = extract_domain(url)

    crawl = crawl_url(url)
    signals = extract_signals(crawl.html, crawl.headers, crawl.final_url)
    signals["final_url"] = crawl.final_url

    # Optional TechLeads.fyi API lookup (1 credit) — authoritative tech stack
    cfg = Settings()
    api_enabled = cfg.techleads_api_enabled if use_techleads_api is None else use_techleads_api
    api_techs: list[str] = []
    if api_enabled and cfg.techleads_api_key.strip():
        try:
            lookup = lookup_website(url)
            if not lookup.get("error"):
                signals = merge_lookup_into_signals(signals, lookup)
                api_techs = tech_names_from_lookup(lookup)
                page_meta = lookup.get("page_meta") or {}
                if isinstance(page_meta, dict) and page_meta.get("final_url"):
                    crawl.final_url = str(page_meta["final_url"])
        except Exception as exc:  # noqa: BLE001
            signals["techleads_used"] = False
            signals["techleads_error"] = str(exc)

    enriched = enrich_with_llm(domain, signals)

    # Prefer TechLeads.fyi detected technologies when present
    if api_techs:
        extras = list(enriched.get("technologies") or [])
        enriched["technologies"] = list(dict.fromkeys(api_techs + extras))[:20]
        if signals.get("techleads_meta"):
            enriched["techleads_meta"] = signals["techleads_meta"]
        if signals.get("technology_spend"):
            enriched["technology_spend"] = signals["technology_spend"]
        page_meta = signals.get("techleads_page_meta") or {}
        if isinstance(page_meta, dict):
            if page_meta.get("title") and not enriched.get("title"):
                enriched["title"] = str(page_meta["title"])[:200]
            if page_meta.get("description") and not enriched.get("description"):
                enriched["description"] = str(page_meta["description"])

    website = db.query(Website).filter(Website.domain == domain).first()
    if not website:
        website = Website(domain=domain)
        db.add(website)

    _apply_enrichment_to_website(website, crawl.final_url, signals, enriched)
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


def refresh_website(db: Session, website: Website, *, use_techleads_api: bool = False) -> Website:
    """Re-crawl + enrich. TechLeads API off by default to avoid burning credits on list loads."""
    url = website.source_url or f"https://{website.domain}"
    return detect_and_store(db, url, use_techleads_api=use_techleads_api)


def _apply_enrichment_to_website(
    website: Website,
    final_url: str,
    signals: dict[str, Any],
    enriched: dict[str, Any],
) -> None:
    extras = list(
        dict.fromkeys(
            (enriched.get("extra_technologies") or [])
            + (enriched.get("marketing_stack") or [])
            + (enriched.get("analytics_tools") or [])
            + (enriched.get("payment_providers") or [])
        )
    )

    website.source_url = final_url
    website.title = str(enriched.get("title") or website.domain)[:200]
    website.description = str(enriched.get("description") or "")
    website.category_label = str(enriched.get("category_label") or "Uncategorized")[:120]
    website.subcategory = str(enriched.get("subcategory") or "")[:120]
    website.contact_info = str(enriched.get("contact_info") or "No contact information available")
    website.facebook_url = str(enriched.get("facebook_url") or "")[:255]
    website.twitter_url = str(enriched.get("twitter_url") or "")[:255]
    website.linkedin_url = str(enriched.get("linkedin_url") or "")[:255]
    website.instagram_url = str(enriched.get("instagram_url") or "")[:255]
    website.youtube_url = str(enriched.get("youtube_url") or "")[:255]
    website.extra_technologies = ", ".join(extras)
    website.rank = max(1, min(100, int(enriched.get("rank") or 75)))
    website.signals_json = signals_to_json(signals)
    website.enriched_json = json.dumps(enriched, ensure_ascii=False)
    website.last_crawled_at = datetime.now(timezone.utc)

    # Dedicated AI detail columns
    website.industry = str(enriched.get("industry") or "")[:120]
    website.company_type = str(enriched.get("company_type") or "")[:80]
    website.business_summary = str(enriched.get("business_summary") or "")
    website.marketing_stack = _join_list(enriched.get("marketing_stack"))
    website.analytics_tools = _join_list(enriched.get("analytics_tools"))
    website.payment_providers = _join_list(enriched.get("payment_providers"))
    website.cms_platform = str(enriched.get("cms_platform") or "")[:120]
    website.ecommerce_platform = str(enriched.get("ecommerce_platform") or "")[:120]
    website.hosting_cdn = str(enriched.get("hosting_cdn") or "")[:120]
    website.key_features = _join_list(enriched.get("key_features"), sep=" | ")
    website.target_audience = str(enriched.get("target_audience") or "")[:300]
    website.phone = str(enriched.get("phone") or "")[:80]
    website.address = str(enriched.get("address") or "")[:300]
    website.estimated_traffic_tier = str(enriched.get("estimated_traffic_tier") or "")[:40]
    website.confidence_score = max(0, min(100, int(enriched.get("confidence_score") or 0)))
    website.llm_insights = _join_list(enriched.get("llm_insights"), sep="\n")
    website.llm_used = bool(enriched.get("llm_used"))
    website.llm_error = str(enriched.get("llm_error") or "")
    website.llm_provider = str(enriched.get("llm_provider") or "")[:40]
    website.llm_model = str(enriched.get("llm_model") or "")[:120]


def _join_list(value: Any, *, sep: str = ", ") -> str:
    if isinstance(value, list):
        items = [str(v).strip() for v in value if str(v).strip()]
        return sep.join(items)
    if isinstance(value, str):
        return value.strip()
    return ""


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
        icon_color=TECH_COLORS.get(slug, "#FFD23F"),
        website_count=1,
        category_id=category.id if category else None,
        is_featured=True,
        is_popular=False,
        sort_order=1000 + order,
    )
    db.add(row)
    db.flush()
    return row
