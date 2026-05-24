"""
PhysicsMouseController — Minimum Jerk Trajectory for human-like, energy-efficient mouse movement.
Uses 5th-order polynomial (minimum jerk) for smooth, low-energy paths.
Reduces detection risk + feels natural.
"""

import asyncio
import math
import random
from typing import Tuple


class PhysicsMouseController:
    """
    Advanced mouse controller using physics simulation.
    Movement follows minimum-jerk trajectory (Flash & Hogan 1985).
    """

    def __init__(self):
        self.current_x = 0
        self.current_y = 0

    async def move_to_and_click(self, target_x: int, target_y: int, duration: float = 0.35):
        """
        Move with minimum-jerk trajectory then click.
        duration: total movement time in seconds (0.25-0.6 feels human).
        """
        start_x, start_y = await self._get_current_pos()
        await self._minimum_jerk_move(start_x, start_y, target_x, target_y, duration)
        await asyncio.sleep(0.08 + random.uniform(0, 0.06))
        await self._click(target_x, target_y)

    async def _minimum_jerk_move(self, x0: int, y0: int, x1: int, y1: int, T: float):
        """Generate and execute 5th order minimum jerk trajectory."""
        steps = max(8, int(T * 60))  # ~60Hz updates
        dt = T / steps

        for i in range(steps + 1):
            t = i * dt
            # 5th order polynomial for minimum jerk
            s = 10*(t/T)**3 - 15*(t/T)**4 + 6*(t/T)**5

            cx = x0 + (x1 - x0) * s
            cy = y0 + (y1 - y0) * s

            # Add very small natural tremor
            cx += random.gauss(0, 0.8)
            cy += random.gauss(0, 0.8)

            await self._move_absolute(int(cx), int(cy))
            await asyncio.sleep(dt)

    async def _move_absolute(self, x: int, y: int):
        import subprocess
        subprocess.run(["xdotool", "mousemove", str(x), str(y)],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    async def _click(self, x: int, y: int):
        import subprocess
        subprocess.run(["xdotool", "click", "1"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    async def _get_current_pos(self) -> Tuple[int, int]:
        import subprocess
        result = subprocess.run(
            ["xdotool", "getmouselocation"],
            capture_output=True, text=True
        )
        parts = result.stdout.split()
        x = int(parts[0].split(":")[1])
        y = int(parts[1].split(":")[1])
        return x, y
