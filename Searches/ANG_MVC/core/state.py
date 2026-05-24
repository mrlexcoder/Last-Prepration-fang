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
    from core.adapter_pool import WarmAdapterPool
    from core.cmu_router import CognitiveMotorRouter


class AppState:
    cache: "InfinityCache | None" = None
    world_model: "WorldModel | None" = None
    goal_engine: "GoalEngine | None" = None
    meta_cognition: "MetaCognition | None" = None
    bridge: "MultiStructuralBridge | None" = None
    adapter_pool: "WarmAdapterPool | None" = None   # v3 — Warm Adapter Pool (P0)
    cmu_router: "CognitiveMotorRouter | None" = None  # v3 Pro — decides multiple-calc paths
    ultra_fast_engine: "UltraFastDecisionEngine | None" = None  # v4.344+ — <30ms physics+quantum+future brain
    pro_agi_master: "ProAGIMaster | None" = None  # Top-level professional AGI with full system access
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
