"""
Execution Service — single-shot infer path.
Routes through quantum_router → neurone_mesh → cache store.
"""

import logging
from core.quantum_router import select_runtime
from core.neurone_mesh import run_neurone_mesh
from models.request_models import InferRequest

logger = logging.getLogger("ang.execution_service")


async def execute_request(request: InferRequest) -> dict:
    runtime = select_runtime(request.latency_budget_ms, request.runtime_hint)
    result = await run_neurone_mesh(runtime, request.input, mode="infer")

    output = result.get("output", "")
    confidence = result.get("confidence", 0.0)

    # Store in InfinityCache for future RAG retrieval
    try:
        from core.state import state
        if state.cache:
            state.cache.store(
                text=f"Q: {request.input}\nA: {output}",
                summary=output[:120],
            )
    except Exception as exc:
        logger.debug("cache store skipped: %s", exc)

    return {
        "runtime": runtime,
        "output": output,
        "confidence": confidence,
        "meta": result.get("meta", {}),
    }
