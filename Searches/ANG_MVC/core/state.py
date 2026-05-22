"""
Shared application state — single source of truth for all singletons.
Imported by any layer that needs AGI components, cache, or bridge.
"""

from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from core.infinity_cache import InfinityCache
    from core.multi_structural import MultiStructuralBridge
    from core.agi import WorldModel, GoalEngine, MetaCognition


class AppState:
    cache: "InfinityCache | None" = None
    world_model: "WorldModel | None" = None
    goal_engine: "GoalEngine | None" = None
    meta_cognition: "MetaCognition | None" = None
    bridge: "MultiStructuralBridge | None" = None
    # Hot-reloadable registry cache
    _registry: dict | None = None

    @classmethod
    def registry(cls) -> dict:
        return cls._registry or {}

    @classmethod
    def set_registry(cls, data: dict):
        cls._registry = data


# Module-level singleton — import this everywhere
state = AppState()
