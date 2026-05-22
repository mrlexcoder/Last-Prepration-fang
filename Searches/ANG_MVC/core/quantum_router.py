import json
from pathlib import Path

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "connectors" / "registry.json"


def load_registry():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as fp:
        return json.load(fp)


def select_runtime(latency_budget_ms: int = 200, runtime_hint: str | None = None) -> str:
    registry = load_registry()
    adapters = registry.get("adapters", [])

    if runtime_hint:
        for adapter in adapters:
            if adapter.get("name") == runtime_hint or adapter.get("id") == runtime_hint:
                return adapter.get("id")

    scored = []
    for adapter in adapters:
        hints = adapter.get("resourceHints", {})
        latency = adapter.get("reported_latency_ms", 50)
        cpu = hints.get("cpu", 1)
        score = latency + cpu * 5
        scored.append((score, adapter))

    scored.sort(key=lambda item: item[0])
    return scored[0][1].get("id") if scored else "runtime_adapter_stub"
