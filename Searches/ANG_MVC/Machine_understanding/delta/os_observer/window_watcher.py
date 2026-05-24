"""
WindowWatcher — Detects focus changes
"""

import asyncio


class WindowWatcher:

    def __init__(self):
        self._callbacks = []
        self._last_title = None

    def on_focus_change(self, callback):
        self._callbacks.append(callback)

    async def start(self):
        while True:
            # Simplified — in real version use xdotool + polling
            await asyncio.sleep(1.2)
            # For now just placeholder
            for cb in self._callbacks:
                await cb({"title": "focused_window_placeholder", "app_type": "unknown"})
