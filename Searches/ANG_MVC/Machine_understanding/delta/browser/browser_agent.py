"""
BrowserAgent v4.344 — High-performance Playwright controller
Stealth + efficient content extraction + CDP attach support.
"""

import asyncio
from playwright.async_api import async_playwright, Browser, Page
from bs4 import BeautifulSoup
from readability import Document


class BrowserAgent:

    def __init__(self, mode: str = "autonomous", cdp_url: str = "http://localhost:9222"):
        self.mode = mode
        self.cdp_url = cdp_url
        self._playwright = None
        self._browser: Browser = None
        self._page: Page = None

    async def start(self, headless: bool = False):
        self._playwright = await async_playwright().start()

        if self.mode == "attach":
            self._browser = await self._playwright.chromium.connect_over_cdp(self.cdp_url)
            contexts = self._browser.contexts
            self._page = contexts[0].pages[0] if contexts and contexts[0].pages else await contexts[0].new_page()
        else:
            self._browser = await self._playwright.chromium.launch(headless=headless, args=["--no-sandbox"])
            self._page = await self._browser.new_page()
            await self._page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")

    async def navigate(self, url: str):
        await self._page.goto(url, wait_until="domcontentloaded", timeout=25000)

    async def read_page_content(self) -> dict:
        html = await self._page.content()
        doc = Document(html)
        text = BeautifulSoup(doc.summary(), "html.parser").get_text("\n", strip=True)
        return {
            "url": self._page.url,
            "title": await self._page.title(),
            "readable_text": text[:8000],
        }

    async def search_google(self, query: str):
        await self.navigate(f"https://www.google.com/search?q={query}")
        await asyncio.sleep(0.8)

    async def get_current_url(self):
        return self._page.url
