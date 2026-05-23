"""
SearXNG Client — queries self-hosted SearXNG for 100+ source results.
Returns ranked URLs + snippets in milliseconds.
Falls back to DuckDuckGo instant answers API if SearXNG is unavailable.
"""

import asyncio
import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger("ang.searxng")

SEARXNG_URL     = os.getenv("SEARXNG_URL", "http://localhost:8888")
SEARXNG_TIMEOUT = float(os.getenv("SEARXNG_TIMEOUT", "3.0"))
MAX_RESULTS     = int(os.getenv("SEARXNG_MAX_RESULTS", "20"))

# DuckDuckGo fallback — no API key needed
DDG_URL = "https://html.duckduckgo.com/html/"
DDG_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept": "text/html",
}


async def _ddg_search(query: str, max_results: int = 10) -> list[dict]:
    """DuckDuckGo HTML scrape fallback — works without any API key."""
    try:
        from selectolax.parser import HTMLParser
    except ImportError:
        logger.debug("selectolax not installed, DDG fallback unavailable")
        return []

    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.post(
                DDG_URL,
                data={"q": query, "b": "", "kl": "us-en"},
                headers=DDG_HEADERS,
            )
            if resp.status_code != 200:
                return []

        tree = HTMLParser(resp.text)
        results = []
        for result in tree.css(".result"):
            title_el = result.css_first(".result__title a")
            snippet_el = result.css_first(".result__snippet")
            if not title_el:
                continue
            href = title_el.attributes.get("href", "")
            # DDG wraps URLs — extract real URL
            if "uddg=" in href:
                from urllib.parse import unquote, urlparse, parse_qs
                parsed = urlparse(href)
                real = parse_qs(parsed.query).get("uddg", [""])[0]
                href = unquote(real) if real else href
            if not href.startswith("http"):
                continue
            results.append({
                "url": href,
                "title": title_el.text(strip=True),
                "snippet": snippet_el.text(strip=True) if snippet_el else "",
                "engine": "duckduckgo",
                "score": 1.0,
            })
            if len(results) >= max_results:
                break
        logger.info("DDG fallback: %d results for '%s'", len(results), query[:50])
        return results
    except Exception as exc:
        logger.warning("DDG fallback failed: %s", exc)
        return []


class SearXNGClient:
    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=SEARXNG_URL,
            timeout=SEARXNG_TIMEOUT,
            headers={"Accept": "application/json"},
        )
        self._searxng_ok: Optional[bool] = None  # None = untested

    async def _check_searxng(self) -> bool:
        if self._searxng_ok is not None:
            return self._searxng_ok
        try:
            r = await self._client.get("/healthz", timeout=1.5)
            self._searxng_ok = r.status_code == 200
        except Exception:
            self._searxng_ok = False
        return self._searxng_ok

    async def search(
        self,
        query: str,
        categories: str = "general,news,science,it",
        engines: str = "",
        language: str = "en",
        max_results: int = MAX_RESULTS,
    ) -> list[dict]:
        """
        Returns list of: { url, title, snippet, engine, score }
        Tries SearXNG first, falls back to DuckDuckGo.
        """
        # Try SearXNG
        if await self._check_searxng():
            params = {
                "q": query,
                "format": "json",
                "categories": categories,
                "language": language,
                "pageno": 1,
            }
            if engines:
                params["engines"] = engines
            try:
                resp = await self._client.get("/search", params=params)
                resp.raise_for_status()
                data = resp.json()
                results = data.get("results", [])[:max_results]
                if results:
                    return [
                        {
                            "url": r.get("url", ""),
                            "title": r.get("title", ""),
                            "snippet": r.get("content", ""),
                            "engine": r.get("engine", ""),
                            "score": r.get("score", 0.0),
                        }
                        for r in results
                        if r.get("url")
                    ]
            except Exception as exc:
                logger.warning("SearXNG search failed: %s — falling back to DDG", exc)
                self._searxng_ok = False

        # Fallback: DuckDuckGo
        logger.info("Using DuckDuckGo fallback for: %s", query[:60])
        return await _ddg_search(query, max_results=max_results)

    async def close(self):
        await self._client.aclose()


_client: Optional[SearXNGClient] = None

def get_searxng() -> SearXNGClient:
    global _client
    if _client is None:
        _client = SearXNGClient()
    return _client
