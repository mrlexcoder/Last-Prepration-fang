from fastapi import APIRouter
import json
import time
from pathlib import Path

health_router = APIRouter()

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "connectors" / "registry.json"


@health_router.get("/health")
async def health():
    """Full system health — checks all subsystems."""
    status = {"status": "ok", "service": "AuroraNeuroGrid MVC", "ts": time.time()}

    # Ring buffer
    try:
        import httpx, os
        r = httpx.get(os.getenv("RINGBUF_URL", "http://localhost:8090") + "/health", timeout=0.5)
        status["ringbuf"] = "ok" if r.status_code == 200 else "degraded"
    except Exception:
        status["ringbuf"] = "offline"

    # Web RAG / SearXNG
    try:
        from web_intel.searxng_client import get_searxng
        client = get_searxng()
        ok = await client._check_searxng()
        status["searxng"] = "ok" if ok else "offline_ddg_fallback"
    except Exception:
        status["searxng"] = "unknown"

    return status


@health_router.get("/connectors")
async def list_connectors():
    registry = json.loads(REGISTRY_PATH.read_text())
    adapters = registry.get("adapters", [])
    return {
        "count": len(adapters),
        "adapters": [
            {
                "id": a["id"],
                "name": a.get("name"),
                "capabilities": a.get("capabilities", []),
                "latency_ms": a.get("reported_latency_ms"),
                "resourceHints": a.get("resourceHints", {}),
            }
            for a in adapters
        ],
    }
