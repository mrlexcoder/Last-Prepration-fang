"""
FilesystemWatcher v4.344 — inotify based with entropy filtering.
"""

import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class SmartFileHandler(FileSystemEventHandler):
    def __init__(self, callback):
        self.callback = callback

    def on_modified(self, event):
        if not event.is_directory:
            asyncio.create_task(self.callback({
                "type": "file_modified",
                "path": event.src_path,
                "entropy_hint": "high" if any(x in event.src_path for x in ['.py', '.md', '.txt']) else "low"
            }))


class FilesystemWatcher:
    def __init__(self, paths: List[str]):
        self.paths = paths
        self._callbacks = []
        self._observer = None

    def on_change(self, callback):
        self._callbacks.append(callback)

    async def start(self):
        self._observer = Observer()
        handler = SmartFileHandler(self._dispatch)
        for path in self.paths:
            self._observer.schedule(handler, path, recursive=True)
        self._observer.start()
        while True:
            await asyncio.sleep(2)

    async def _dispatch(self, event):
        for cb in self._callbacks:
            await cb(event)
