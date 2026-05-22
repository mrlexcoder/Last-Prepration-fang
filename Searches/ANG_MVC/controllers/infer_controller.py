from fastapi import APIRouter, HTTPException
from models.request_models import InferRequest
from services.execution_service import execute_request

infer_router = APIRouter()

@infer_router.post("/infer")
async def infer(request: InferRequest):
    try:
        response = await execute_request(request)
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
