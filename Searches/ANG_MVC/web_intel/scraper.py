"""
ANG Web Scraper
Async fetch with Playwright fallback for JS-heavy pages.
Uses Trafilatura for clean text extraction + Selectolax for fast HTML parsing.

Pipeline per URL:
  1. httpx async fetch (fast, <100ms)
  2. If JS detected → Playwright headless (fallback)
  3. Trafilatura extract → clean article text
  4. Selectolax fallback → raw text from DOM
  5. Chunk → Kafka ang.clean_chunks
"""

import asyncio
import logging
import os
import re
import time
from typing import Optional
from urllib.parse import urlparse

import httpx

logger = logging.getLogger("ang.scraper")

SCRAPER_CONCURRENCY = int(os.getenv("SCRAPER_CONCURRENCY", "20"))
FETCH_TIMEOUT       = float(os.getenv("FETCH_TIMEOUT", "5.0"))
CHUNK_SIZE          = int(os.getenv("CHUNK_SIZE", "400"))   # tokens approx
CHUNK_OVERLAP       = int(os.getenv("CHUNK_OVERLAP", "50"))
MAX_CHUNKS_PER_URL  = int(os.getenv("MAX_CHUNKS_PER_URL", "8"))

# Rotate user agents to avoid blocks
_USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
]

def _random_ua() -> str:
    import random
    return random.choice(_USER_AGENTS)

_JS_SIGNALS = ["__NEXT_DATA__", "window.__", "React.createElement", "angular", "vue.js"]


def _needs_js(html: str) -> bool:
    return any(sig in html for sig in _JS_SIGNALS) and len(html) < 5000


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping word-level chunks."""
    words = text.split()
    if not words:
        return []
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + size])
        if len(chunk.strip()) > 50:
            chunks.append(chunk)
        i += size - overlap
    return chunks[:MAX_CHUNKS_PER_URL]


def _extract_with_trafilatura(html: str, url: str) -> Optional[str]:
    try:
        import trafilatura
        text = trafilatura.extract(
            html,
            url=url,
            include_comments=False,
            include_tables=True,
            no_fallback=False,
            favor_precision=False,
            favor_recall=True,
        )
        return text
    except Exception as exc:
        logger.debug("trafilatura failed for %s: %s", url, exc)
        return None


def _extract_with_selectolax(html: str) -> Optional[str]:
    try:
        from selectolax.parser import HTMLParser
        tree = HTMLParser(html)
        # Remove noise tags
        for tag in tree.css("script, style, nav, footer, header, aside, .ad, .ads"):
            tag.decompose()
        text = tree.body.text(separator=" ", strip=True) if tree.body else ""
        # Collapse whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text if len(text) > 100 else None
    except Exception as exc:
        logger.debug("selectolax failed: %s", exc)
        return None


async def _fetch_httpx(url: str, client: httpx.AsyncClient) -> Optional[str]:
    try:
        resp = await client.get(url, follow_redirects=True, timeout=FETCH_TIMEOUT)
        if resp.status_code == 200:
            ct = resp.headers.get("content-type", "")
            if "html" in ct or "text" in ct:
                return resp.text
    except Exception as exc:
        logger.debug("httpx fetch failed %s: %s", url, exc)
    return None


async def _fetch_playwright(url: str) -> Optional[str]:
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
            page = await browser.new_page()
            await page.goto(url, timeout=8000, wait_until="domcontentloaded")
            await page.wait_for_timeout(1500)  # let JS render
            html = await page.content()
            await browser.close()
            return html
    except Exception as exc:
        logger.debug("playwright failed %s: %s", url, exc)
        return None


async def scrape_url(url: str, query: str, producer) -> list[str]:
    """
    Scrape a single URL. Returns list of clean text chunks.
    Publishes chunks to Kafka ang.clean_chunks.
    """
    t0 = time.perf_counter()

    async with httpx.AsyncClient(
        headers={"User-Agent": _random_ua()},
        timeout=FETCH_TIMEOUT,
    ) as client:
        html = await _fetch_httpx(url, client)

    if html and _needs_js(html):
        logger.debug("JS page detected, using Playwright: %s", url)
        html = await _fetch_playwright(url) or html

    if not html:
        return []

    # Extract clean text — Trafilatura first, Selectolax fallback
    text = _extract_with_trafilatura(html, url) or _extract_with_selectolax(html)
    if not text:
        return []

    chunks = _chunk_text(text)
    latency = (time.perf_counter() - t0) * 1000
    logger.debug("scraped %s → %d chunks in %.0fms", url, len(chunks), latency)

    # Publish to Kafka
    for i, chunk in enumerate(chunks):
        await producer.send_clean_chunk(url=url, chunk=chunk, query=query, chunk_idx=i)

    return chunks


class WebScraper:
    """
    Concurrent scraper — processes URL queue with semaphore-limited concurrency.
    """

    def __init__(self, concurrency: int = SCRAPER_CONCURRENCY):
        self._sem = asyncio.Semaphore(concurrency)

    async def scrape_many(self, urls: list[str], query: str, producer) -> dict[str, list[str]]:
        """Scrape all URLs concurrently. Returns {url: [chunks]}."""
        async def _bounded(url):
            async with self._sem:
                return url, await scrape_url(url, query, producer)

        tasks = [_bounded(u) for u in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        out = {}
        for r in results:
            if isinstance(r, tuple):
                url, chunks = r
                if chunks:
                    out[url] = chunks
        return out
