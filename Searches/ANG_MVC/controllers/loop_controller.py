from fastapi import APIRouter, HTTPException
from models.loop_models import LoopRequest
from services.loop_service import run_automation_loop

loop_router = APIRouter()


@loop_router.post("/loop")
async def automation_loop(request: LoopRequest):
    try:
        return await run_automation_loop(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
