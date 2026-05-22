from fastapi import APIRouter
import json
from pathlib import Path

health_router = APIRouter()

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "connectors" / "registry.json"


@health_router.get("/health")
async def health():
    return {"status": "ok", "service": "AuroraNeuroGrid MVC"}


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
