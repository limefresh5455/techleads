import re
from urllib.parse import urlparse

_DOMAIN_RE = re.compile(
    r"^(?:https?://)?(?:www\.)?([^/?#]+)",
    re.IGNORECASE,
)


def normalize_url(raw: str) -> str:
    value = (raw or "").strip()
    if not value:
        raise ValueError("URL is required")
    if not value.startswith(("http://", "https://")):
        value = f"https://{value}"
    parsed = urlparse(value)
    if not parsed.netloc:
        raise ValueError("Invalid URL")
    return value


def extract_domain(raw: str) -> str:
    url = normalize_url(raw)
    host = urlparse(url).netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower().strip())
    return slug.strip("-")[:180] or "unknown"
