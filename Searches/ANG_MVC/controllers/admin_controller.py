"""
Admin endpoints:
  POST /admin/refresh-connectors  — hot-reload registry.json into AppState
  GET  /admin/agi-status          — snapshot of all AGI layer components
  GET  /admin/cache-stats         — InfinityCache stats
"""

import logging
from fastapi import APIRouter, HTTPException
from core.quantum_router import reload_registry
from core.state import state

logger = logging.getLogger("ang.admin")
admin_router = APIRouter(prefix="/admin")


def register_agi(world_model=None, goal_engine=None, meta_cognition=None, cache=None):
    """Called from app.py lifespan to inject AGI layer into shared state."""
    if world_model:
        state.world_model = world_model
    if goal_engine:
        state.goal_engine = goal_engine
    if meta_cognition:
        state.meta_cognition = meta_cognition
    if cache:
        state.cache = cache


@admin_router.post("/refresh-connectors")
async def refresh_connectors():
    """Hot-reload connectors/registry.json — no restart needed."""
    try:
        data = reload_registry()
        count = len(data.get("adapters", []))
        logger.info("connectors refreshed: %d adapters", count)
        return {"refreshed": True, "adapter_count": count, "adapters": data.get("adapters", [])}
    except Exception as exc:
        logger.error("refresh-connectors failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@admin_router.get("/agi-status")
async def agi_status():
    return {
        "world_model": state.world_model.snapshot() if state.world_model else "not_initialized",
        "goal_engine": state.goal_engine.snapshot() if state.goal_engine else "not_initialized",
        "meta_cognition": state.meta_cognition.snapshot() if state.meta_cognition else "not_initialized",
    }


@admin_router.get("/cache-stats")
async def cache_stats():
    if not state.cache:
        return {"status": "not_initialized"}
    return state.cache.stats()
