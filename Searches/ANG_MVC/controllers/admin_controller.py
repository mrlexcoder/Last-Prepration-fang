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


def register_agi(world_model=None, goal_engine=None, meta_cognition=None, cache=None, cmu_router=None):
    """Called from app.py lifespan to inject AGI layer into shared state."""
    if world_model:
        state.world_model = world_model
    if goal_engine:
        state.goal_engine = goal_engine
    if meta_cognition:
        state.meta_cognition = meta_cognition
    if cache:
        state.cache = cache
    if cmu_router:
        state.cmu_router = cmu_router


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


@admin_router.get("/storage-stats")
async def storage_stats():
    """Stats from Go store + Rust ring buffer."""
    try:
        from core.storage_client import get_storage
        return get_storage().storage_stats()
    except Exception as exc:
        return {"error": str(exc)}


@admin_router.get("/mem0-status")
async def mem0_status():
    try:
        from core.mem0_layer import get_mem0
        mem = get_mem0()
        return {"available": mem.available, "backend": "mem0" if mem.available else "go_store"}
    except Exception as exc:
        return {"error": str(exc)}


@admin_router.get("/letta-agents")
async def letta_agents():
    try:
        from core.letta_agent import get_letta
        letta = get_letta()
        return {"available": letta.available, "agents": letta.list_agents()}
    except Exception as exc:
        return {"error": str(exc)}


@admin_router.get("/training-status")
async def training_status():
    """Current training queue size and latest adapter."""
    try:
        from core.storage_client import get_storage
        from pathlib import Path
        import os
        storage = get_storage()
        samples = storage.get_training_queue(min_quality=0.75)
        adapter_dir = Path(os.getenv("ANG_ADAPTER_DIR", "/data/ang_adapters"))
        latest = ""
        marker = adapter_dir / "latest_adapter.txt"
        if marker.exists():
            latest = marker.read_text().strip()
        return {
            "queued_samples": len(samples),
            "min_quality": 0.75,
            "latest_adapter": latest,
            "auto_train_enabled": os.getenv("ANG_AUTO_TRAIN", "0") == "1",
        }
    except Exception as exc:
        return {"error": str(exc)}


@admin_router.get("/adapter-pool")
async def adapter_pool_status():
    """v3 — WarmAdapterPool status (P0 critical component)."""
    if not state.adapter_pool:
        return {"status": "not_initialized", "message": "WarmAdapterPool not enabled in this run"}
    return await state.adapter_pool.health()
