"""
Bridge controller — Multi-Structural Bridge HTTP interface.
POST /api/bridge  { "mode": "chat|search|tools|pipeline", "input": "...", ... }
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.state import state

logger = logging.getLogger("ang.bridge_controller")
bridge_router = APIRouter()


def register_bridge(bridge):
    state.bridge = bridge


class BridgeRequest(BaseModel):
    mode: str
    input: str
    history: Optional[list] = None
    tools: Optional[list] = None
    steps: Optional[list] = None


@bridge_router.post("/bridge")
async def bridge_execute(request: BridgeRequest):
    if state.bridge is None:
        raise HTTPException(status_code=503, detail="Bridge not initialized")
    try:
        payload = request.model_dump(exclude_none=True)
        return await state.bridge.execute(mode=request.mode, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("bridge error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
