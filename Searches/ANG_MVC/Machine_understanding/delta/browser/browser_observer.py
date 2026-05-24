"""
BrowserObserver v4.344 — Watches for URL changes, new tabs, etc.
"""

import asyncio


class BrowserObserver:
    def __init__(self, browser_agent):
        self.browser = browser_agent
        self._last_url = None
        self._callbacks = []

    def on_change(self, callback):
        self._callbacks.append(callback)

    async def start(self):
        while True:
            try:
                url = await self.browser.get_current_url()
                if url != self._last_url:
                    self._last_url = url
                    for cb in self._callbacks:
                        await cb({"type": "url_change", "url": url})
            except:
                pass
            await asyncio.sleep(2)
