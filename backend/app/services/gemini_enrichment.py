import json
import logging
import re
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

ENRICHMENT_SCHEMA = """
Return ONLY valid JSON with this shape:
{
  "title": "string",
  "description": "string (2-4 sentences about the business and website)",
  "category_label": "string (e.g. E-Commerce, SaaS, Agency, Blog)",
  "industry": "string",
  "company_type": "string (B2B, B2C, D2C, Marketplace, etc.)",
  "business_summary": "string (what the company does, who they serve)",
  "technologies": ["primary detected tech names"],
  "extra_technologies": ["additional widgets, plugins, integrations"],
  "marketing_stack": ["email, ads, CRM, automation tools"],
  "analytics_tools": ["analytics and tracking tools"],
  "payment_providers": ["payment gateways if any"],
  "cms_platform": "string or empty",
  "ecommerce_platform": "string or empty",
  "hosting_cdn": "string or empty",
  "key_features": ["notable product/site features, 3-6 items"],
  "target_audience": "string",
  "contact_info": "primary email or contact method",
  "phone": "string or empty",
  "address": "string or empty",
  "facebook_url": "string or empty",
  "twitter_url": "string or empty",
  "linkedin_url": "string or empty",
  "instagram_url": "string or empty",
  "youtube_url": "string or empty",
  "estimated_traffic_tier": "Low | Medium | High | Unknown",
  "confidence_score": 0-100,
  "rank": 1-100,
  "llm_insights": ["3-5 actionable sales intelligence bullets"]
}
"""

MODEL_FALLBACKS = (
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
)


def enrich_with_gemini(domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    if not settings.gemini_api_key or not settings.gemini_api_key.strip():
        return _with_meta(_fallback_enrichment(domain, signals), llm_used=False, llm_error="GEMINI_API_KEY not set")

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key.strip())
        prompt = _build_prompt(domain, signals)
        models = [settings.gemini_model, *MODEL_FALLBACKS]
        seen: set[str] = set()
        last_error = ""

        for model_name in models:
            if not model_name or model_name in seen:
                continue
            seen.add(model_name)
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    prompt,
                    generation_config={"temperature": 0.2, "max_output_tokens": 4096},
                )
                text = (response.text or "").strip()
                if not text:
                    last_error = f"{model_name}: empty response"
                    continue
                data = _parse_json_response(text, domain, signals)
                data["llm_model"] = model_name
                return _with_meta(data, llm_used=True, llm_error="")
            except Exception as exc:
                last_error = f"{model_name}: {exc}"
                logger.warning("Gemini enrichment failed for %s with %s", domain, last_error)

        fallback = _fallback_enrichment(domain, signals)
        return _with_meta(fallback, llm_used=False, llm_error=last_error or "All Gemini models failed")
    except Exception as exc:
        logger.exception("Gemini client error for %s", domain)
        return _with_meta(_fallback_enrichment(domain, signals), llm_used=False, llm_error=str(exc))


def _build_prompt(domain: str, signals: dict[str, Any]) -> str:
    return (
        "You are a website technology analyst for a B2B sales intelligence platform.\n"
        f"Domain: {domain}\n"
        f"Final URL: {signals.get('final_url', '')}\n"
        f"Extracted signals JSON:\n{json.dumps(signals, ensure_ascii=False)[:14000]}\n\n"
        "Analyze the site deeply. Infer CMS, ecommerce, frameworks, analytics, marketing automation, "
        "CDN, chat widgets, reviews, payments, and martech stack.\n"
        "Write concrete technology names. Provide useful sales intelligence in llm_insights.\n"
        "If signals are sparse, infer reasonably from the domain and industry patterns.\n"
        f"{ENRICHMENT_SCHEMA}"
    )


def _with_meta(data: dict[str, Any], *, llm_used: bool, llm_error: str) -> dict[str, Any]:
    data["llm_used"] = llm_used
    data["llm_error"] = llm_error
    return data


def _parse_json_response(text: str, domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    cleaned = text
    if "```" in cleaned:
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        cleaned = match.group(0)
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

    extras = ["Cloudflare CDN", "Open Graph", "Google Tag Manager"]
    marketing = [t for t in technologies if t in {"HubSpot", "Klaviyo", "Mailchimp", "Intercom"}]
    analytics = [t for t in technologies if "Analytics" in t or "Tag Manager" in t]

    return {
        "title": title,
        "description": description,
        "category_label": category,
        "industry": category,
        "company_type": "Unknown",
        "business_summary": description,
        "technologies": technologies[:8] or ["Unknown"],
        "extra_technologies": extras,
        "marketing_stack": marketing or ["Not detected"],
        "analytics_tools": analytics or ["Not detected"],
        "payment_providers": [t for t in technologies if t == "Stripe"] or [],
        "cms_platform": next((t for t in technologies if t in {"WordPress", "Drupal", "Wix", "Squarespace", "Webflow"}), ""),
        "ecommerce_platform": next((t for t in technologies if t in {"Shopify", "WooCommerce", "Magento"}), ""),
        "hosting_cdn": "Cloudflare" if "Cloudflare" in technologies else "",
        "key_features": ["Technology detection based on page signals"],
        "target_audience": "Unknown",
        "contact_info": emails[0] if emails else "No contact information available",
        "phone": "",
        "address": "",
        "facebook_url": socials.get("facebook", ""),
        "twitter_url": socials.get("twitter", ""),
        "linkedin_url": socials.get("linkedin", ""),
        "instagram_url": "",
        "youtube_url": "",
        "estimated_traffic_tier": "Unknown",
        "confidence_score": 45,
        "rank": 75,
        "llm_insights": [
            f"Detected {len(technologies)} technologies from crawl signals.",
            "Add a valid GEMINI_API_KEY from Google AI Studio for deeper AI enrichment.",
        ],
    }


def _as_str_list(value: Any, fallback: list[str]) -> list[str]:
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()][:12]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return fallback


def _normalize_enrichment(data: dict[str, Any], domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    fallback = _fallback_enrichment(domain, signals)
    technologies = _as_str_list(data.get("technologies"), fallback["technologies"])

    return {
        "title": str(data.get("title") or fallback["title"])[:200],
        "description": str(data.get("description") or fallback["description"])[:2000],
        "category_label": str(data.get("category_label") or fallback["category_label"])[:120],
        "industry": str(data.get("industry") or fallback["industry"])[:120],
        "company_type": str(data.get("company_type") or fallback["company_type"])[:80],
        "business_summary": str(data.get("business_summary") or fallback["business_summary"])[:1500],
        "technologies": technologies[:12],
        "extra_technologies": _as_str_list(data.get("extra_technologies"), fallback["extra_technologies"])[:20],
        "marketing_stack": _as_str_list(data.get("marketing_stack"), fallback["marketing_stack"])[:10],
        "analytics_tools": _as_str_list(data.get("analytics_tools"), fallback["analytics_tools"])[:10],
        "payment_providers": _as_str_list(data.get("payment_providers"), fallback["payment_providers"])[:8],
        "cms_platform": str(data.get("cms_platform") or fallback["cms_platform"])[:120],
        "ecommerce_platform": str(data.get("ecommerce_platform") or fallback["ecommerce_platform"])[:120],
        "hosting_cdn": str(data.get("hosting_cdn") or fallback["hosting_cdn"])[:120],
        "key_features": _as_str_list(data.get("key_features"), fallback["key_features"])[:8],
        "target_audience": str(data.get("target_audience") or fallback["target_audience"])[:300],
        "contact_info": str(data.get("contact_info") or fallback["contact_info"])[:500],
        "phone": str(data.get("phone") or fallback["phone"])[:80],
        "address": str(data.get("address") or fallback["address"])[:300],
        "facebook_url": str(data.get("facebook_url") or fallback["facebook_url"])[:255],
        "twitter_url": str(data.get("twitter_url") or fallback["twitter_url"])[:255],
        "linkedin_url": str(data.get("linkedin_url") or fallback["linkedin_url"])[:255],
        "instagram_url": str(data.get("instagram_url") or fallback["instagram_url"])[:255],
        "youtube_url": str(data.get("youtube_url") or fallback["youtube_url"])[:255],
        "estimated_traffic_tier": str(data.get("estimated_traffic_tier") or fallback["estimated_traffic_tier"])[:40],
        "confidence_score": max(0, min(100, int(data.get("confidence_score") or fallback["confidence_score"]))),
        "rank": max(1, min(100, int(data.get("rank") or fallback["rank"]))),
        "llm_insights": _as_str_list(data.get("llm_insights"), fallback["llm_insights"])[:8],
    }
