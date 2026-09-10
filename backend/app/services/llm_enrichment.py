"""LLM-powered website scraping enrichment via OpenRouter (OpenAI gpt-oss-120b)."""

from __future__ import annotations

import json
import logging
import re
import time
import threading
from typing import Any

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)


def _settings() -> Settings:
    """Re-read .env so key/model updates apply without a full process restart."""
    return Settings()


_openrouter_semaphore: threading.Semaphore | None = None
_semaphore_lock = threading.Lock()

def get_openrouter_semaphore() -> threading.Semaphore:
    global _openrouter_semaphore
    if _openrouter_semaphore is None:
        with _semaphore_lock:
            if _openrouter_semaphore is None:
                cfg = _settings()
                _openrouter_semaphore = threading.Semaphore(getattr(cfg, 'openrouter_max_concurrency', 3))
    return _openrouter_semaphore

ENRICHMENT_SCHEMA = """
Return ONLY valid JSON with this shape:
{
  "title": "string",
  "description": "string (2-4 sentences about the business and website)",
  "industry": "string",
  "company_type": "string (B2B, B2C, D2C, Marketplace, etc.)",
  "category_label": "string",
  "subcategory": "string or empty",
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

# OpenRouter LLM enrichment — OpenAI gpt-oss-120b
# https://openrouter.ai/openai/gpt-oss-120b
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def enrich_with_llm(domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    """Enrich scraped site signals with OpenAI gpt-oss-120b via OpenRouter."""
    return enrich_with_openrouter(domain, signals)


def enrich_with_openrouter(domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    cfg = _settings()
    api_key = cfg.openrouter_api_key.strip()
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    prompt = build_prompt(domain, signals)
    models = [cfg.openrouter_model]
    if getattr(cfg, 'openrouter_model_fallbacks', None):
        models.extend([m.strip() for m in cfg.openrouter_model_fallbacks.split(",") if m.strip()])
    
    # Filter out empty or duplicate models while preserving order
    unique_models = []
    seen_m = set()
    for m in models:
        if m and m not in seen_m:
            unique_models.append(m)
            seen_m.add(m)
            
    last_error = ""
    error_category = "unknown"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": cfg.openrouter_http_referer,
        "X-Title": cfg.openrouter_app_title,
    }

    timeout = httpx.Timeout(cfg.openrouter_timeout_seconds)
    
    # We will use a shared HTTP client for connection pooling if possible, but for simplicity here we keep it scoped.
    # Note: openrouter_max_retries controls retries PER error that allows retry (429, 5xx)
    max_retries = getattr(cfg, 'openrouter_max_retries', 3)
    initial_delay = getattr(cfg, 'openrouter_initial_retry_delay', 2.0)
    max_delay = getattr(cfg, 'openrouter_max_retry_delay', 16.0)

    model_idx = 0
    while model_idx < len(unique_models):
        model_name = unique_models[model_idx]
        payload = {
            "model": model_name,
            "temperature": 0.2,
            "max_tokens": 4096,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a website technology analyst for a B2B sales intelligence platform. "
                        "Respond with ONLY valid JSON. No markdown fences, no commentary."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        }
        
        attempt = 0
        
        while attempt <= max_retries:
            try:
                semaphore = get_openrouter_semaphore()
                with semaphore:
                    with httpx.Client(timeout=timeout) as client:
                        response = client.post(OPENROUTER_URL, headers=headers, json=payload)
                    
                status = response.status_code
                
                if status < 400:
                    body = response.json()
                    text = _extract_openrouter_text(body)
                    if not text:
                        last_error = f"{model_name}: empty response"
                        error_category = "empty_response"
                        logger.warning(f"[OpenRouter] domain={domain} model={model_name} status=200 category={error_category} retry={attempt}/{max_retries} next_retry=None")
                        break # break retry loop, try next model
                        
                    data = parse_json_response(text, domain, signals)
                    used_model = (
                        body.get("model")
                        or (body.get("choices") or [{}])[0].get("model")
                        or model_name
                    )
                    data["llm_model"] = used_model
                    data["llm_provider"] = "openrouter"
                    logger.info(f"[OpenRouter] domain={domain} model={used_model} status=200 category=success")
                    return with_meta(data, llm_used=True, llm_error="")

                # Handle errors
                last_error = f"{model_name}: HTTP {status} {response.text[:300]}"
                
                if status == 429:
                    error_category = "rate_limited"
                    if attempt < max_retries:
                        retry_after = response.headers.get("Retry-After")
                        if retry_after and retry_after.isdigit():
                            delay = float(retry_after)
                        else:
                            delay = min(initial_delay * (2 ** attempt), max_delay)
                        logger.warning(f"[OpenRouter] domain={domain} model={model_name} status={status} category={error_category} retry={attempt+1}/{max_retries} next_retry={delay}s")
                        time.sleep(delay)
                        attempt += 1
                        continue # retry same model
                    else:
                        logger.error(f"[OpenRouter] domain={domain} model={model_name} status={status} category={error_category} retry={attempt}/{max_retries} next_retry=None (Max retries reached)")
                        # Do NOT fall back. Stop completely.
                        raise RuntimeError(f"HTTP {status} rate_limited: {last_error}")
                        
                elif status == 402:
                    error_category = "credits_required"
                    logger.error(f"[OpenRouter] domain={domain} model={model_name} status={status} category={error_category} retry={attempt}/{max_retries} next_retry=None")
                    # Do NOT fall back. Stop completely.
                    raise RuntimeError(f"HTTP {status} credits_required: {last_error}")
                    
                elif status == 404:
                    error_category = "model_unavailable"
                    logger.warning(f"[OpenRouter] domain={domain} model={model_name} status={status} category={error_category} retry={attempt}/{max_retries} next_retry=None")
                    # Skip to next model immediately, no retry
                    break
                    
                elif status >= 500:
                    error_category = "server_error"
                    if attempt < max_retries:
                        delay = min(initial_delay * (2 ** attempt), max_delay)
                        logger.warning(f"[OpenRouter] domain={domain} model={model_name} status={status} category={error_category} retry={attempt+1}/{max_retries} next_retry={delay}s")
                        time.sleep(delay)
                        attempt += 1
                        continue
                    else:
                        break
                        
                else:
                    error_category = "client_error"
                    # 400, 403, etc - no point retrying exactly the same request
                    logger.warning(f"[OpenRouter] domain={domain} model={model_name} status={status} category={error_category} retry={attempt}/{max_retries} next_retry=None")
                    break

            except Exception as exc:
                last_error = f"{model_name}: {exc}"
                error_category = "network_error"
                if attempt < max_retries:
                    delay = min(initial_delay * (2 ** attempt), max_delay)
                    logger.warning(f"[OpenRouter] domain={domain} model={model_name} status=Exception category={error_category} error={exc} retry={attempt+1}/{max_retries} next_retry={delay}s")
                    time.sleep(delay)
                    attempt += 1
                    continue
                else:
                    break
                    
        # End of retry loop for current model
        model_idx += 1
        
    # If all models failed or we broke out
    raise RuntimeError(last_error or "OpenRouter enrichment failed for all models")



def build_prompt(domain: str, signals: dict[str, Any]) -> str:
    compact = _compact_signals(signals)
    return (
        "You are a website technology analyst for a B2B sales intelligence platform.\n"
        f"Domain: {domain}\n"
        f"Final URL: {signals.get('final_url', '')}\n"
        f"Extracted crawl/scrape signals JSON:\n{json.dumps(compact, ensure_ascii=False)[:14000]}\n\n"
        "Analyze the site deeply from the scraped signals. Infer CMS, ecommerce, frameworks, "
        "analytics, marketing automation, CDN, chat widgets, reviews, payments, and martech stack.\n"
        "Write concrete technology names. Provide useful sales intelligence in llm_insights.\n"
        "If signals are sparse, infer reasonably from the domain and industry patterns.\n"
        f"{ENRICHMENT_SCHEMA}"
    )


def with_meta(data: dict[str, Any], *, llm_used: bool, llm_error: str, llm_error_category: str = "") -> dict[str, Any]:
    data["llm_used"] = llm_used
    data["llm_error"] = llm_error
    if llm_error_category:
        data["llm_error_category"] = llm_error_category
    return data


def parse_json_response(text: str, domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    cleaned = text
    if "```" in cleaned:
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        cleaned = match.group(0)
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return normalize_enrichment(data, domain, signals)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"LLM returned invalid JSON: {e}")
    raise RuntimeError("LLM returned non-dictionary JSON")


def as_str_list(value: Any, fallback: list[str]) -> list[str]:
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()][:12]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return fallback


def normalize_enrichment(data: dict[str, Any], domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    technologies = as_str_list(data.get("technologies"), [])

    return {
        "title": str(data.get("title") or "")[:200],
        "description": str(data.get("description") or "")[:2000],
        "industry": str(data.get("industry") or "")[:120],
        "company_type": str(data.get("company_type") or "")[:80],
        "category_label": str(data.get("category_label") or "")[:120],
        "subcategory": str(data.get("subcategory") or "")[:120],
        "business_summary": str(data.get("business_summary") or "")[:1500],
        "technologies": technologies[:12],
        "extra_technologies": as_str_list(data.get("extra_technologies"), [])[:20],
        "marketing_stack": as_str_list(data.get("marketing_stack"), [])[:10],
        "analytics_tools": as_str_list(data.get("analytics_tools"), [])[:10],
        "payment_providers": as_str_list(data.get("payment_providers"), [])[:8],
        "cms_platform": str(data.get("cms_platform") or "")[:120],
        "ecommerce_platform": str(data.get("ecommerce_platform") or "")[:120],
        "hosting_cdn": str(data.get("hosting_cdn") or "")[:120],
        "key_features": as_str_list(data.get("key_features"), [])[:8],
        "target_audience": str(data.get("target_audience") or "")[:300],
        "contact_info": str(data.get("contact_info") or "")[:500],
        "phone": str(data.get("phone") or "")[:80],
        "address": str(data.get("address") or "")[:300],
        "facebook_url": str(data.get("facebook_url") or "")[:255],
        "twitter_url": str(data.get("twitter_url") or "")[:255],
        "linkedin_url": str(data.get("linkedin_url") or "")[:255],
        "instagram_url": str(data.get("instagram_url") or "")[:255],
        "youtube_url": str(data.get("youtube_url") or "")[:255],
        "estimated_traffic_tier": str(data.get("estimated_traffic_tier") or "")[:40],
        "confidence_score": max(0, min(100, int(data.get("confidence_score") or 0))),
        "rank": max(1, min(100, int(data.get("rank") or 1))),
        "llm_insights": as_str_list(data.get("llm_insights"), [])[:8],
    }


def _extract_openrouter_text(body: dict[str, Any]) -> str:
    choices = body.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    content = message.get("content")
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and item.get("type") == "text":
                parts.append(str(item.get("text") or ""))
        return "".join(parts).strip()
    return ""


def _compact_signals(signals: dict[str, Any]) -> dict[str, Any]:
    """Trim bulky HTML-ish fields so free models stay within context."""
    compact = dict(signals)
    for key in ("html_snippet", "body_text", "script_srcs", "link_hrefs", "visible_text"):
        value = compact.get(key)
        if isinstance(value, str) and len(value) > 4000:
            compact[key] = value[:4000]
        elif isinstance(value, list) and len(value) > 40:
            compact[key] = value[:40]
    return compact


