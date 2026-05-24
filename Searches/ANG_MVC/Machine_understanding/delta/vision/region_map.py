"""
region_map.py — Divides screen into semantic zones for targeted processing (pro efficiency).
"""

from PIL import Image
from typing import Dict


class RegionMap:
    """Semantic screen zoning for low-resource targeted analysis."""

    ZONES = {
        "top_bar": (0, 0, 1.0, 0.08),
        "left_sidebar": (0, 0.08, 0.2, 0.85),
        "main_content": (0.2, 0.08, 0.8, 0.85),
        "bottom_bar": (0, 0.93, 1.0, 0.07),
    }

    def get_zone(self, frame, zone_name: str) -> Image.Image:
        w, h = frame.image.size
        x1, y1, x2, y2 = self.ZONES[zone_name]
        box = (int(x1*w), int(y1*h), int(x2*w), int(y2*h))
        return frame.image.crop(box)
