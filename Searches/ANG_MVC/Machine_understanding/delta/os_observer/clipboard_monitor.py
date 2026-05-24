"""
ClipboardMonitor v4.344 — Watches clipboard for interesting content (math, code, URLs).
"""

import asyncio
import pyperclip


class ClipboardMonitor:
    def __init__(self):
        self._callbacks = []
        self._last = ""

    def on_change(self, callback):
        self._callbacks.append(callback)

    async def start(self):
        while True:
            try:
                current = pyperclip.paste()
                if current and current != self._last and len(current) > 5:
                    self._last = current
                    for cb in self._callbacks:
                        await cb({
                            "type": "clipboard",
                            "content": current[:500],
                            "is_code": "def " in current or "import " in current,
                            "is_url": current.startswith("http")
                        })
            except:
                pass
            await asyncio.sleep(1.5)
