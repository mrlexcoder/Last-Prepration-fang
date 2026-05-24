import asyncio
import logging
import random
import time
import hashlib
import numpy as np
from typing import List, Dict, Any
import httpx

try:
    from playwright.async_api import async_playwright
    HAS_PLAYWRIGHT = True
except Exception:
    HAS_PLAYWRIGHT = False

from core.infinity_cache.cache import InfinityCache
from core.agi.world_model import WorldModel

logger = logging.getLogger("ang.scraper_grid")

# 100+ domains from PRO BLUEPRINT – science/math/biology focus for auto-generation
SCRAPER_SITES: List[Dict[str, Any]] = [
    # Science & Research (high priority for concept generation)
    {"url": "https://arxiv.org/list/cs.AI/recent", "category": "ai_neural", "method": "rss", "freq_s": 300},
    {"url": "https://arxiv.org/list/q-bio/recent", "category": "biology", "method": "rss", "freq_s": 300},
    {"url": "https://pubmed.ncbi.nlm.nih.gov/?term=neural+networks", "category": "neural_biology", "method": "html", "freq_s": 600},
    {"url": "https://www.nature.com/nature/articles", "category": "science", "method": "html", "freq_s": 900},
    {"url": "https://en.wikipedia.org/wiki/Artificial_neural_network", "category": "neural", "method": "html", "freq_s": 3600},
    {"url": "https://en.wikipedia.org/wiki/Circle_packing", "category": "math", "method": "html", "freq_s": 3600},
    {"url": "https://en.wikipedia.org/wiki/Lotka%E2%80%93Volterra_equations", "category": "biology", "method": "html", "freq_s": 3600},
    # Add more from blueprint as needed (news, finance, tech for breadth)
    {"url": "https://news.ycombinator.com/", "category": "tech", "method": "html", "freq_s": 120},
]

class ScraperGrid:
    def __init__(self, cache: InfinityCache, wm: WorldModel):
        self.cache = cache
        self.wm = wm
        self.semaphore = asyncio.Semaphore(30)  # parallel workers
        self.running = False

    async def run_forever(self):
        self.running = True
        logger.info("ScraperGrid v3 PRO starting for science/math/biology concept harvesting...")
        tasks = [self._schedule(site) for site in SCRAPER_SITES]
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _schedule(self, site: Dict):
        while self.running:
            async with self.semaphore:
                try:
                    text = await self._fetch(site)
                    if text and len(text) > 100:
                        h = hashlib.md5(text[:2000].encode()).digest()
                        vec = np.frombuffer(h, dtype=np.uint8).astype(np.float32) / 255.0
                        self.cache.store(site['url'], text[:4000], vec)
                        # Feed directly to WorldModel for ProAGIMaster to generate programs from
                        self.wm.observe({
                            "source": site['url'],
                            "category": site.get('category', 'science'),
                            "content": text[:1500],
                            "timestamp": time.time(),
                            "concept_ready": True   # flag for generator
                        })
                        logger.info("Harvested science concept from %s (%s)", site['url'], site['category'])
                except Exception as e:
                    logger.debug("scrape %s failed: %s", site['url'], e)
            await asyncio.sleep(site['freq_s'] + random.uniform(0, 30))

    async def _fetch(self, site: Dict) -> str:
        url = site['url']
        if site.get('method') == 'js' and HAS_PLAYWRIGHT:
            return await self._playwright_fetch(url)
        try:
            async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
                r = await client.get(url, headers={"User-Agent": "ANG-Pro-Scraper/3.0"})
                if r.status_code == 200:
                    return self._extract_text(r.text)
        except Exception:
            pass
        return ""

    async def _playwright_fetch(self, url: str) -> str:
        if not HAS_PLAYWRIGHT:
            return ""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=20000)
            content = await page.content()
            await browser.close()
            return self._extract_text(content)

    def _extract_text(self, html: str) -> str:
        # Lightweight extraction (trafilatura/selectolax available in env)
        try:
            import trafilatura
            extracted = trafilatura.extract(html)
            if extracted:
                return extracted
        except Exception:
            pass
        # fallback simple
        import re
        text = re.sub(r'<[^>]+>', ' ', html)
        return ' '.join(text.split())[:8000]

    def stop(self):
        self.running = False

# Global instance for state
_scraper_grid: ScraperGrid | None = None

def get_scraper_grid(cache: InfinityCache = None, wm: WorldModel = None) -> ScraperGrid:
    global _scraper_grid
    if _scraper_grid is None and cache and wm:
        _scraper_grid = ScraperGrid(cache, wm)
    return _scraper_grid
