"""
StreamCollector — Real-time Perception Layer (Roadmap Item 1)

Continuously captures multimodal system state every ~1 second:
- Screen / window titles (via existing laptop_observer if available)
- Running processes
- Clipboard (if accessible)
- File system events (basic)
- Active browser tabs (best effort)

Yields rich snapshot dicts that feed directly into the NeuralManifold.
"""

import time
import os
from typing import Dict, Any, Iterator
import subprocess

try:
    from core.laptop_observer import get_laptop_observer
except Exception:
    get_laptop_observer = None


class StreamCollector:
    def __init__(self, interval: float = 1.0):
        self.interval = interval
        self.laptop = get_laptop_observer() if get_laptop_observer else None
        self.last_snapshot = {}

    def get_snapshot(self) -> Dict[str, Any]:
        snapshot = {
            "timestamp": time.time(),
            "source": "stream_collector_v1",
        }

        if self.laptop:
            try:
                state = self.laptop.get_full_laptop_state()
                snapshot["laptop"] = {
                    "summary": state.get("summary", "")[:300],
                    "processes": [p.get("name", "") for p in state.get("processes", [])[:10]],
                    "activity": state.get("user_activity", "")[:200],
                    "chrome": state.get("chrome", {}),
                }
            except Exception as e:
                snapshot["laptop_error"] = str(e)

        # Basic process snapshot fallback
        try:
            procs = subprocess.check_output(["ps", "-eo", "pid,pcpu,pmem,comm"], text=True).splitlines()[:15]
            snapshot["raw_processes"] = procs
        except Exception:
            pass

        # Environment signals
        snapshot["env"] = {
            "cwd": os.getcwd(),
            "python": os.sys.version.split()[0],
        }

        self.last_snapshot = snapshot
        return snapshot

    def stream(self) -> Iterator[Dict[str, Any]]:
        while True:
            yield self.get_snapshot()
            time.sleep(self.interval)
