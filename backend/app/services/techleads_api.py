"""TechLeads.fyi customer API v3 client (web lookup).

Docs: https://techleads.fyi/docs
Base: https://techleads.fyi/api/v3
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)

API_BASE = "https://techleads.fyi/api/v3"


def _settings() -> Settings:
    return Settings()


def _headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "User-Agent": "TechLeads.Ai/1.0",
    }


def get_account_info() -> dict[str, Any]:
    cfg = _settings()
    key = cfg.techleads_api_key.strip()
    if not key:
        return {"success": False, "error": "TECHLEADS_API_KEY not set"}
    with httpx.Client(timeout=30.0) as client:
        res = client.get(f"{API_BASE}/account/info", headers=_headers(key))
        res.raise_for_status()
        return res.json()


def lookup_website(url: str) -> dict[str, Any]:
    """Lookup technologies for one domain/URL. Costs 1 credit."""
    cfg = _settings()
    key = cfg.techleads_api_key.strip()
    if not key:
        return {"error": "TECHLEADS_API_KEY not set", "technologies": []}

    with httpx.Client(timeout=60.0) as client:
        res = client.get(
            f"{API_BASE}/web/lookup",
            params={"url": url},
            headers=_headers(key),
        )
        res.raise_for_status()
        data = res.json()
        if not isinstance(data, dict):
            return {"error": "Unexpected response", "technologies": []}
        return data


def lookup_batch(domains: list[str]) -> dict[str, Any]:
    """Batch lookup up to 1000 domains. 1 credit each."""
    cfg = _settings()
    key = cfg.techleads_api_key.strip()
    if not key:
        return {"error": "TECHLEADS_API_KEY not set", "results": []}

    payload = {"domains": domains[:1000]}
    with httpx.Client(timeout=120.0) as client:
        res = client.post(
            f"{API_BASE}/web/lookup/batch",
            headers={**_headers(key), "Content-Type": "application/json"},
            json=payload,
        )
        res.raise_for_status()
        data = res.json()
        return data if isinstance(data, dict) else {"results": data}


def tech_names_from_lookup(payload: dict[str, Any]) -> list[str]:
    techs = payload.get("technologies") or []
    names: list[str] = []
    for item in techs:
        if isinstance(item, dict):
            name = str(item.get("name") or "").strip()
        else:
            name = str(item).strip()
        if name and name not in names:
            names.append(name)
    return names


def merge_lookup_into_signals(signals: dict[str, Any], lookup: dict[str, Any]) -> dict[str, Any]:
    """Attach TechLeads.fyi lookup results onto crawl signals for LLM enrichment."""
    out = dict(signals)
    names = tech_names_from_lookup(lookup)
    if names:
        existing = list(out.get("rule_based_technologies") or [])
        out["rule_based_technologies"] = list(dict.fromkeys(names + existing))
        out["techleads_technologies"] = names

    page_meta = lookup.get("page_meta") if isinstance(lookup.get("page_meta"), dict) else {}
    if page_meta:
        out["techleads_page_meta"] = page_meta
        if page_meta.get("title"):
            out["page_title"] = page_meta.get("title")
        if page_meta.get("description"):
            out["page_description"] = page_meta.get("description")
        if page_meta.get("final_url"):
            out["final_url"] = page_meta.get("final_url")

    spend = lookup.get("technology_spend")
    if isinstance(spend, dict):
        out["technology_spend"] = spend

    meta = lookup.get("meta") if isinstance(lookup.get("meta"), dict) else {}
    out["techleads_meta"] = {
        "credits_used": meta.get("credits_used"),
        "credits_remaining": meta.get("credits_remaining"),
        "detected_at": lookup.get("detected_at"),
        "error": lookup.get("error"),
    }
    out["techleads_used"] = True
    return out
