"""
Pro AGI Controller — REST API for talking to the top-level ProAGIMaster.

Endpoints:
- POST /api/pro/agi/chat          → Send message to the Pro AGI
- POST /api/pro/agi/autonomous/start
- POST /api/pro/agi/autonomous/stop
- GET  /api/pro/agi/status
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.state import state

router = APIRouter(prefix="/pro/agi", tags=["Pro AGI Master"])


class ChatRequest(BaseModel):
    message: str
    context: dict = None


@router.post("/chat")
async def chat_with_pro_agi(req: ChatRequest):
    pro = state.pro_agi_master
    if not pro:
        raise HTTPException(status_code=503, detail="Pro AGI Master not initialized yet")

    try:
        response = await pro.communicate(req.message, context=req.context)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pro AGI error: {str(e)}")


@router.post("/autonomous/start")
async def start_autonomous():
    pro = state.pro_agi_master
    if not pro:
        raise HTTPException(status_code=503, detail="Pro AGI Master not ready")

    if not pro.running_autonomy:
        import asyncio
        asyncio.create_task(pro.start_autonomous_mode())
        return {"status": "autonomous_mode_started"}
    return {"status": "already_running"}


@router.post("/autonomous/stop")
async def stop_autonomous():
    pro = state.pro_agi_master
    if pro:
        pro.stop_autonomous_mode()
    return {"status": "autonomous_mode_stopped"}


@router.get("/status")
async def get_status():
    pro = state.pro_agi_master
    if not pro:
        return {"initialized": False}

    return {
        "initialized": True,
        "autonomous_running": pro.running_autonomy,
        "goals": pro.goals,
        "tools_available": list(pro.tools.tools.keys()) if hasattr(pro, 'tools') else [],
        "last_thoughts": pro.last_thoughts[-10:] if hasattr(pro, 'last_thoughts') else []
    }

@router.get("/improvements")
async def get_improvements(limit: int = 20):
    pro = state.pro_agi_master
    if not pro:
        return []
    return await pro.get_improvement_history(limit)

@router.get("/current_thoughts")
async def get_current_thoughts():
    pro = state.pro_agi_master
    if not pro:
        return []
    return pro.last_thoughts[-20:] if hasattr(pro, 'last_thoughts') else []

class VoiceCommandRequest(BaseModel):
    command: str

@router.post("/voice")
async def voice_command(req: VoiceCommandRequest):
    """Real-time voice command endpoint — talk to the system and it acts on Linux."""
    pro = state.pro_agi_master
    if not pro:
        raise HTTPException(503, "Pro AGI not ready")
    try:
        result = pro.tools.execute_voice_command(req.command)
        return result
    except Exception as e:
        raise HTTPException(500, f"Voice command failed: {str(e)}")
