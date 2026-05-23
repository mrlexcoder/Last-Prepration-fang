"""
Quantum Router — selects the optimal runtime adapter.

Decision signals:
  - explicit runtime_hint (name or id)
  - latency_budget_ms
  - resourceHints.cpu score
  - context_size (future: penalise adapters with small ctx windows)

Uses AppState._registry so hot-reload via /admin/refresh-connectors
takes effect immediately without re-reading disk on every request.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger("ang.quantum_router")

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "connectors" / "registry.json"


def _load_from_disk() -> dict:
    try:
        return json.loads(REGISTRY_PATH.read_text())
    except Exception as exc:
        logger.error("registry load failed: %s", exc)
        return {"adapters": []}


def get_registry() -> dict:
    """Return registry from AppState cache, falling back to disk."""
    from core.state import state
    if state._registry is None:
        data = _load_from_disk()
        state.set_registry(data)
    return state._registry


def reload_registry() -> dict:
    """Force re-read from disk and update AppState cache."""
    data = _load_from_disk()
    from core.state import state
    state.set_registry(data)
    logger.info("registry reloaded: %d adapters", len(data.get("adapters", [])))
    return data


def select_runtime(
    latency_budget_ms: int = 200,
    runtime_hint: str | None = None,
    context_size: int = 0,
) -> str:
    registry = get_registry()
    adapters = registry.get("adapters", [])

    if not adapters:
        logger.warning("no adapters in registry — using stub fallback")
        return "runtime_adapter_stub"

    # 1. Explicit hint wins
    if runtime_hint:
        for a in adapters:
            if a.get("name") == runtime_hint or a.get("id") == runtime_hint:
                logger.debug("runtime selected by hint: %s", a["id"])
                return a["id"]
        logger.warning("runtime_hint '%s' not found — falling back to scoring", runtime_hint)

    # v3 Pro Scoring (Neural-Quantum preference)
    # Favor real capable models (instruction/chat) over pure speed stubs
    # unless the caller explicitly wants ultra-low latency.
    scored = []
    for a in adapters:
        hints = a.get("resourceHints", {})
        latency = a.get("reported_latency_ms", 50)
        cpu = hints.get("cpu", 1)
        caps = a.get("capabilities", [])

        # Base score
        score = latency + cpu * 5

        # Strong penalty for exceeding budget
        if latency > latency_budget_ms:
            score += 2000

        # v3 Pro: Heavily prefer real capable models (instruction/chat) over stubs
        is_real = "instruction" in caps or "chat" in caps
        if is_real:
            score -= 1500   # very strong preference for real AGI models
        else:
            score += 1200   # heavy penalty for dumb stubs when real brains exist

        scored.append((score, a))

    scored.sort(key=lambda x: x[0])
    chosen = scored[0][1]["id"]
    logger.info("v3 quantum_router selected: %s (score=%.0f, real_model=%s)", 
                chosen, scored[0][0], "yes" if "instruction" in scored[0][1].get("capabilities", []) else "no")
    return chosen
