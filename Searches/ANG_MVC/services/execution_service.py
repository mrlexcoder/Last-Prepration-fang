from core.quantum_router import select_runtime
from core.neurone_mesh import run_neurone_mesh
from models.request_models import InferRequest

async def execute_request(request: InferRequest) -> dict:
    runtime = select_runtime(request.latency_budget_ms, request.runtime_hint)
    result = await run_neurone_mesh(runtime, request.input)

    return {
        "runtime": runtime,
        "output": result["output"],
        "confidence": result.get("confidence", 0.0),
        "meta": result.get("meta", {}),
    }
