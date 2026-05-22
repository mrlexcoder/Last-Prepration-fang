import asyncio
from .quantum_router import quick_select

# Simple neurone-mesh orchestrator skeleton focusing on fast decisions

async def call_adapter(adapter_module, input_text, stream=False):
    # adapters must implement async infer(input_text) -> dict
    return await adapter_module.infer(input_text)

async def execute(request: dict):
    """Execute a minimal loop: select runtime -> infer -> evaluate -> return.

    Request fields:
    - input: str
    - latency_budget_ms: int
    - runtime_hint: optional
    """
    ctx = {
        "latency_budget_ms": request.get("latency_budget_ms", 200),
        "runtime_hint": request.get("runtime_hint"),
    }
    adapter_id = quick_select(ctx)

    # dynamic import of adapter stub by id -> maps to module path in connectors/registry.json
    from pathlib import Path
    import json
    reg_path = Path(__file__).parent / "connectors" / "registry.json"
    reg = json.loads(reg_path.read_text())
    adapter_map = {a["id"]: a for a in reg.get("adapters", [])}
    adapter_info = adapter_map.get(adapter_id)
    if not adapter_info:
        # fallback to local stub
        from .runtime_adapters import runtime_adapter_stub as adapter_module
    else:
        # for demo, allow only the stub; future: import by entrypoint
        from .runtime_adapters import runtime_adapter_stub as adapter_module

    start = asyncio.get_event_loop().time()
    result = await call_adapter(adapter_module, request.get("input", ""))
    latency = (asyncio.get_event_loop().time() - start) * 1000

    # quick evaluation: if confidence exists and above threshold, accept, else mark for review
    conf = result.get("confidence", 0.8)
    accepted = conf >= 0.5

    return {
        "adapter_id": adapter_id,
        "result": result,
        "latency_ms": latency,
        "accepted": accepted,
    }
