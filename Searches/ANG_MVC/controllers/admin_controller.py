"""
Admin endpoints:
  POST /admin/refresh-connectors  — hot-reload registry.json
  GET  /admin/agi-status          — snapshot of AGI layer state
  GET  /admin/cache-stats         — InfinityCache stats
"""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

logger = logging.getLogger("ang.admin")
admin_router = APIRouter(prefix="/admin")

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "connectors" / "registry.json"

# Shared AGI singletons — imported lazily to avoid circular deps
_agi_instances: dict = {}


def register_agi(world_model=None, goal_engine=None, meta_cognition=None, cache=None):
    """Called from app.py to inject AGI layer references."""
    if world_model:
        _agi_instances["world_model"] = world_model
    if goal_engine:
        _agi_instances["goal_engine"] = goal_engine
    if meta_cognition:
        _agi_instances["meta_cognition"] = meta_cognition
    if cache:
        _agi_instances["cache"] = cache


@admin_router.post("/refresh-connectors")
async def refresh_connectors():
    """Hot-reload connectors/registry.json without restarting the service."""
    try:
        data = json.loads(REGISTRY_PATH.read_text())
        count = len(data.get("adapters", []))
        logger.info("connectors refreshed: %d adapters", count)
        return {"refreshed": True, "adapter_count": count, "adapters": data.get("adapters", [])}
    except Exception as exc:
        logger.error("refresh-connectors failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@admin_router.get("/agi-status")
async def agi_status():
    """Return a snapshot of all AGI layer components."""
    result = {}
    for key in ("world_model", "goal_engine", "meta_cognition"):
        obj = _agi_instances.get(key)
        result[key] = obj.snapshot() if obj and hasattr(obj, "snapshot") else "not_initialized"
    return result


@admin_router.get("/cache-stats")
async def cache_stats():
    cache = _agi_instances.get("cache")
    if not cache:
        return {"status": "not_initialized"}
    return cache.stats()
