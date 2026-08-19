"""Deprecated: enrichment now uses OpenRouter openai/gpt-oss-120b only."""

from __future__ import annotations

from typing import Any

from app.services.llm_enrichment import fallback_enrichment, with_meta


def enrich_with_gemini(domain: str, signals: dict[str, Any]) -> dict[str, Any]:
    return with_meta(
        fallback_enrichment(domain, signals),
        llm_used=False,
        llm_error="Gemini disabled; use OPENROUTER_MODEL=openai/gpt-oss-120b",
    )
