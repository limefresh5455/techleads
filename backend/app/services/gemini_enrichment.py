import json
import re
from typing import Any

from app.core.config import settings

ENRICHMENT_SCHEMA = """
Return ONLY valid JSON with this shape:
{
  "title": "string",
  "description": "string",
  "category_label": "string",
  "technologies": ["string"],
  "extra_technologies": ["string"],
  "contact_info": "string",
  "facebook_url": "string",
  "twitter_url": "string",
  "linkedin_url": "string",
  "rank": 50
}
"""


def enrich_with_gemini(domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    if not settings.gemini_api_key:
        return _fallback_enrichment(domain, signals)

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        prompt = (
            "You analyze websites and detect their technology stack for a sales intelligence platform.\n"
            f"Domain: {domain}\n"
            f"Extracted signals JSON:\n{json.dumps(signals, ensure_ascii=False)[:12000]}\n\n"
            "Infer CMS, ecommerce platform, frameworks, analytics, marketing, CDN, plugins, and widgets.\n"
            "Use the signals and your knowledge. Prefer concrete technology names.\n"
            f"{ENRICHMENT_SCHEMA}"
        )
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        return _parse_json_response(text, domain, signals)
    except Exception:
        return _fallback_enrichment(domain, signals)


def _parse_json_response(text: str, domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    cleaned = text
    if "```" in cleaned:
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return _normalize_enrichment(data, domain, signals)
    except json.JSONDecodeError:
        pass
    return _fallback_enrichment(domain, signals)


def _fallback_enrichment(domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    technologies = list(dict.fromkeys(signals.get("rule_based_technologies", [])))
    if signals.get("generator"):
        technologies.insert(0, signals["generator"])

    title = signals.get("title") or domain.split(".")[0].replace("-", " ").title()
    description = (
        signals.get("meta_description")
        or f"Website technology profile for {domain}, analyzed by TechLeads.Ai."
    )
    emails = signals.get("emails") or []
    socials = signals.get("social_links") or {}

    category = "Uncategorized"
    if any(t.lower() in {"shopify", "woocommerce", "magento"} for t in technologies):
        category = "E-Commerce"
    elif any(t.lower() in {"wordpress", "drupal", "wix", "squarespace", "webflow"} for t in technologies):
        category = "CMS"

    return {
        "title": title,
        "description": description,
        "category_label": category,
        "technologies": technologies[:8] or ["Unknown"],
        "extra_technologies": ["Cloudflare CDN", "Open Graph", "Google Tag Manager"],
        "contact_info": emails[0] if emails else "No contact information available",
        "facebook_url": socials.get("facebook", ""),
        "twitter_url": socials.get("twitter", ""),
        "linkedin_url": socials.get("linkedin", ""),
        "rank": 75,
    }


def _normalize_enrichment(data: dict[str, Any], domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    fallback = _fallback_enrichment(domain, signals)
    technologies = data.get("technologies") or fallback["technologies"]
    if isinstance(technologies, str):
        technologies = [technologies]

    extras = data.get("extra_technologies") or fallback["extra_technologies"]
    if isinstance(extras, str):
        extras = [extras]

    return {
        "title": str(data.get("title") or fallback["title"])[:200],
        "description": str(data.get("description") or fallback["description"])[:2000],
        "category_label": str(data.get("category_label") or fallback["category_label"])[:120],
        "technologies": [str(t) for t in technologies if str(t).strip()][:12],
        "extra_technologies": [str(t) for t in extras if str(t).strip()][:20],
        "contact_info": str(data.get("contact_info") or fallback["contact_info"])[:500],
        "facebook_url": str(data.get("facebook_url") or fallback["facebook_url"])[:255],
        "twitter_url": str(data.get("twitter_url") or fallback["twitter_url"])[:255],
        "linkedin_url": str(data.get("linkedin_url") or fallback["linkedin_url"])[:255],
        "rank": int(data.get("rank") or fallback["rank"]),
    }
