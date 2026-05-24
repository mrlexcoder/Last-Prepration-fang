"""
WindowManager v4.344 — Fast Linux window introspection
"""

import asyncio
import subprocess


class WindowManager:

    async def get_desktop_summary(self) -> dict:
        proc = await asyncio.create_subprocess_exec(
            "wmctrl", "-lG",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL
        )
        out, _ = await proc.communicate()
        windows = []
        for line in out.decode().splitlines():
            parts = line.split(None, 7)
            if len(parts) >= 8:
                windows.append({"title": parts[7], "id": parts[0]})

        return {
            "total_windows": len(windows),
            "windows": windows[:12]
        }
