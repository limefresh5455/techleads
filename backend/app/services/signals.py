import json
import re
from typing import Any

from bs4 import BeautifulSoup

SIGNATURES: dict[str, list[str]] = {
    "WordPress": ["wp-content", "wp-includes", "wordpress"],
    "Shopify": ["cdn.shopify.com", "shopify", "myshopify.com"],
    "WooCommerce": ["woocommerce", "wc-ajax"],
    "React": ["react", "_next/static", "__NEXT_DATA__"],
    "Next.js": ["_next/static", "__NEXT_DATA__", "next.js"],
    "Vue.js": ["vue.js", "__vue__", "vue-router"],
    "Angular": ["ng-version", "angular"],
    "Google Analytics": ["google-analytics.com", "gtag(", "ga('create"],
    "Google Tag Manager": ["googletagmanager.com", "gtm.js"],
    "HubSpot": ["js.hs-scripts.com", "hubspot"],
    "Hotjar": ["hotjar.com", "static.hotjar.com"],
    "Stripe": ["js.stripe.com", "stripe.com/v3"],
    "Cloudflare": ["cloudflare", "cf-ray"],
    "Klaviyo": ["klaviyo.com", "static.klaviyo.com"],
    "Mailchimp": ["mailchimp", "mc.us"],
    "Intercom": ["intercom", "widget.intercom.io"],
    "Drupal": ["drupal", "sites/default/files"],
    "Magento": ["mage/cookies", "magento"],
    "Wix": ["wix.com", "static.wixstatic.com"],
    "Squarespace": ["squarespace", "static.squarespace.com"],
    "Webflow": ["webflow", "assets.website-files.com"],
    "Judge.me": ["judge.me", "cdn.judge.me"],
}


def _match_signatures(haystack: str) -> list[str]:
    found: list[str] = []
    lower = haystack.lower()
    for name, needles in SIGNATURES.items():
        if any(needle in lower for needle in needles):
            found.append(name)
    return found


def extract_signals(html: str, headers: dict[str, str], url: str) -> dict[str, Any]:
    soup = BeautifulSoup(html or "", "html.parser")

    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    meta_description = ""
    meta_tag = soup.find("meta", attrs={"name": re.compile(r"description", re.I)})
    if meta_tag and meta_tag.get("content"):
        meta_description = meta_tag["content"].strip()

    generator = ""
    gen_tag = soup.find("meta", attrs={"name": "generator"})
    if gen_tag and gen_tag.get("content"):
        generator = gen_tag["content"].strip()

    script_srcs = [
        src.strip()
        for src in (tag.get("href") or tag.get("src") or "" for tag in soup.find_all(["script", "link"]))
        if src.strip()
    ][:80]

    social_links = {
        "facebook": _first_href(soup, r"facebook\.com"),
        "twitter": _first_href(soup, r"(twitter\.com|x\.com)"),
        "linkedin": _first_href(soup, r"linkedin\.com"),
    }

    emails = list(dict.fromkeys(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html)))[:5]

    haystack = " ".join(
        [
            html[:120000],
            " ".join(f"{k}:{v}" for k, v in headers.items()),
            generator,
            " ".join(script_srcs),
        ]
    )
    detected = _match_signatures(haystack)

    return {
        "url": url,
        "title": title,
        "meta_description": meta_description,
        "generator": generator,
        "script_and_link_sources": script_srcs[:40],
        "response_headers": {k: headers[k] for k in list(headers)[:20]},
        "rule_based_technologies": detected,
        "social_links": social_links,
        "emails": emails,
    }


def _first_href(soup: BeautifulSoup, pattern: str) -> str:
    for tag in soup.find_all("a", href=True):
        href = tag["href"]
        if re.search(pattern, href, re.I):
            return href
    return ""


def signals_to_json(signals: dict[str, Any]) -> str:
    return json.dumps(signals, ensure_ascii=False)
