from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

from .neurone_mesh import execute
from . import quantum_router

app = FastAPI(title="AuroraNeuroGrid Execution Demo")

class InferRequest(BaseModel):
    input: str
    latency_budget_ms: int = 200
    runtime_hint: str | None = None

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/infer")
async def infer(request: InferRequest):
    try:
        out = await execute(request.dict())
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/refresh-connectors")
async def refresh_connectors():
    # For this demo registry is file-based; endpoint returns its content
    from pathlib import Path
    import json
    reg = Path(__file__).parent / "connectors" / "registry.json"
    try:
        data = json.loads(reg.read_text())
        return {"loaded": True, "count": len(data.get("adapters", []))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
