import json
import time
from pathlib import Path

REGISTRY_PATH = Path(__file__).parent / "connectors" / "registry.json"

def load_registry():
    try:
        return json.loads(REGISTRY_PATH.read_text())
    except Exception:
        return {}

def quick_select(context: dict) -> str:
    """Very fast selection heuristic for runtime adapter name.
    Prioritize: explicit hint -> latency budget -> resourceHints.cpu
    Returns adapter id string from registry or 'runtime_adapter_stub'.
    """
    registry = load_registry()
    adapters = registry.get("adapters", [])

    # explicit hint
    hint = context.get("runtime_hint")
    if hint:
        for a in adapters:
            if a.get("name") == hint:
                return a.get("id")

    # latency budget preference: prefer low-latency adapters first
    budget = context.get("latency_budget_ms", 200)
    # score = lower cpu + lower reported_latency (simulated) when budget small
    scored = []
    for a in adapters:
        hints = a.get("resourceHints", {})
        cpu = hints.get("cpu", 4)
        reported_latency = a.get("reported_latency_ms", 50)
        score = reported_latency + cpu * 5
        scored.append((score, a))

    scored.sort(key=lambda x: x[0])
    # pick first that fits budget * 2 (be permissive)
    for score, a in scored:
        if a.get("reported_latency_ms", 50) <= max(50, budget * 2):
            return a.get("id")

    # fallback
    if adapters:
        return adapters[0].get("id")
    return "runtime_adapter_stub"
