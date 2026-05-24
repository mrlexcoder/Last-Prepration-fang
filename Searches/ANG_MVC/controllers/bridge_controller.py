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
    runtime_hint: Optional[str] = None
    user_id: Optional[str] = "default"
    session_id: Optional[str] = None
    use_letta: Optional[bool] = False
    use_ensemble: Optional[bool] = False  # fast single-model by default for normal chat; ensemble only when explicitly requested or in agentscope mode
    force_live: Optional[bool] = False


class LearningSignalRequest(BaseModel):
    prompt: str
    response: str
    confidence: float = 0.5
    metrics: dict = {}


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


@bridge_router.post("/bridge/learn")
async def bridge_learn(request: LearningSignalRequest):
    """Send a learning signal to the auto-learner."""
    if state.auto_learner is None:
        raise HTTPException(status_code=503, detail="Auto-learner not initialized")
    try:
        await state.auto_learner.on_signal(
            prompt=request.prompt,
            response=request.response,
            metrics={
                "confidence": request.confidence,
                **request.metrics
            }
        )
        return {"status": "learned", "timestamp": state.auto_learner.stats["signals_processed"]}
    except Exception as exc:
        logger.error("learning error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@bridge_router.get("/bridge/learn/stats")
async def bridge_learn_stats():
    """Get auto-learning statistics."""
    if state.auto_learner:
        return state.auto_learner.get_stats()
    return {"error": "Auto-learner not initialized"}

@bridge_router.post("/bridge/superintelligence/evolve")
async def superintelligence_evolve(payload: dict):
    """Start superintelligence evolution process."""
    try:
        from core.pro_superintelligence_enhancer import get_superintelligence_enhancer
        enhancer = get_superintelligence_enhancer()
        target_lines = payload.get("target_lines", 1000000)
        
        # Run in background
        async def run_evolution():
            result = await enhancer.evolve_system(target_lines)
            return result
            
        asyncio.create_task(run_evolution())
        return {"status": "evolution_started", "target_lines": target_lines}
    except Exception as e:
        return {"error": str(e)}

@bridge_router.get("/bridge/superintelligence/status")
async def superintelligence_status():
    """Get superintelligence evolution status."""
    try:
        from core.pro_superintelligence_enhancer import get_superintelligence_enhancer
        enhancer = get_superintelligence_enhancer()
        return {
            "cycles": enhancer.evolution_cycles,
            "lines_generated": enhancer.lines_generated,
            "active": enhancer.active
        }
    except Exception as e:
        return {"error": str(e)}
