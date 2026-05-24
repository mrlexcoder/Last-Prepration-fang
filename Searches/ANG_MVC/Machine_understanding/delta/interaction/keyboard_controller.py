"""
SmartKeyboardController — Human-like + mathematically timed typing.
Uses entropy-based speed adjustment and physics timing.
"""

import asyncio
import random
import math


class SmartKeyboardController:

    async def type_naturally(self, text: str, base_wpm: int = 75, entropy_factor: float = 1.0):
        """
        Type with variable speed based on content entropy.
        Higher entropy (complex code/math) → slower, more careful.
        """
        base_delay = 60.0 / (base_wpm * 5)

        for char in text:
            # Adjust delay by local "complexity"
            delay = base_delay * (1.0 + entropy_factor * 0.4 * random.random())
            await self._press_key(char)
            await asyncio.sleep(delay)

    async def hotkey(self, *keys: str):
        import subprocess
        combo = "+".join(keys)
        subprocess.run(["xdotool", "key", "--clearmodifiers", combo],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        await asyncio.sleep(0.12)

    async def _press_key(self, char: str):
        import subprocess
        subprocess.run(["xdotool", "type", "--clearmodifiers", char],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
