"""
ProcessWatcher v4.344 — Monitors CPU, memory, and interesting processes.
"""

import psutil
import asyncio
from typing import List, Dict


class ProcessWatcher:

    def __init__(self):
        self._callbacks = []

    def on_change(self, callback):
        self._callbacks.append(callback)

    async def start(self):
        while True:
            processes = []
            for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    info = p.info
                    if info['cpu_percent'] > 5 or 'python' in info['name'].lower() or 'chrome' in info['name'].lower():
                        processes.append(info)
                except:
                    pass
            for cb in self._callbacks:
                await cb({"type": "processes", "data": processes[:10]})
            await asyncio.sleep(4)
