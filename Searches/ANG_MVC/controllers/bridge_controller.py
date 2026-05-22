"""
Bridge controller — exposes Multi-Structural Bridge modes via HTTP.

POST /api/bridge
  body: { "mode": "chat|search|tools|pipeline", "input": "...", ...mode-specific fields }
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Optional

logger = logging.getLogger("ang.bridge_controller")
bridge_router = APIRouter()

# Injected at startup from app.py
_bridge_instance = None


def register_bridge(bridge):
    global _bridge_instance
    _bridge_instance = bridge


class BridgeRequest(BaseModel):
    mode: str
    input: str
    history: Optional[list] = None
    tools: Optional[list] = None
    steps: Optional[list] = None


@bridge_router.post("/bridge")
async def bridge_execute(request: BridgeRequest):
    if _bridge_instance is None:
        raise HTTPException(status_code=503, detail="Bridge not initialized")
    try:
        payload = request.model_dump(exclude_none=True)
        result = await _bridge_instance.execute(mode=request.mode, payload=payload)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("bridge error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
