from dataclasses import dataclass

import httpx

from app.core.config import settings


@dataclass
class CrawlResult:
    url: str
    final_url: str
    status_code: int
    html: str
    headers: dict[str, str]


def crawl_url(url: str) -> CrawlResult:
    headers = {"User-Agent": settings.crawl_user_agent, "Accept": "text/html,application/xhtml+xml"}
    with httpx.Client(
        timeout=settings.crawl_timeout_seconds,
        follow_redirects=True,
        headers=headers,
    ) as client:
        response = client.get(url)
        response.raise_for_status()
        return CrawlResult(
            url=url,
            final_url=str(response.url),
            status_code=response.status_code,
            html=response.text or "",
            headers={k.lower(): v for k, v in response.headers.items()},
        )
