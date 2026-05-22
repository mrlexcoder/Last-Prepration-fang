"""
Neurone Mesh — orchestration core.

Responsibilities:
  - Load and call the correct runtime adapter
  - Record observations into WorldModel
  - Feed outcomes to MetaCognition self-model
  - Structured logging on every inference
"""

import importlib
import logging
import time

from core.quantum_router import get_registry

logger = logging.getLogger("ang.neurone_mesh")


def _load_adapter_fn(adapter_id: str):
    """Resolve adapter entrypoint from registry. Falls back to stub."""
    registry = get_registry()
    adapters = registry.get("adapters", [])

    adapter = next((a for a in adapters if a["id"] == adapter_id), None)
    if not adapter:
        logger.warning("adapter '%s' not found — falling back to stub", adapter_id)
        adapter = next((a for a in adapters if a["id"] == "runtime_adapter_stub"), None)

    if not adapter:
        raise RuntimeError("No adapters available in registry")

    module_name, fn_name = adapter["entrypoint"].split(":")
    module = importlib.import_module(module_name)
    return getattr(module, fn_name)


async def run_neurone_mesh(
    runtime_id: str,
    prompt: str,
    mode: str = "infer",
) -> dict:
    """
    Core execution path:
      load adapter → infer → observe → record outcome → return
    """
    t0 = time.perf_counter()
    infer_fn = _load_adapter_fn(runtime_id)

    logger.info("neurone_mesh: runtime=%s mode=%s prompt_len=%d",
                runtime_id, mode, len(prompt))

    result = await infer_fn(prompt)
    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
    confidence = result.get("confidence", 0.0)

    logger.info("neurone_mesh: done latency_ms=%.1f confidence=%.2f", latency_ms, confidence)

    # AGI integration — non-blocking, best-effort
    try:
        from core.state import state
        if state.world_model:
            state.world_model.observe(
                event=f"infer:{runtime_id} → {result.get('output', '')[:80]}",
                source=runtime_id,
                metadata={"mode": mode, "latency_ms": latency_ms},
            )
        if state.meta_cognition:
            state.meta_cognition.record_outcome(
                runtime=runtime_id,
                mode=mode,
                confidence=confidence,
                latency_ms=latency_ms,
                success=confidence >= 0.5,
            )
    except Exception as exc:
        logger.debug("AGI integration skipped: %s", exc)

    result["meta"] = result.get("meta", {})
    result["meta"]["latency_ms"] = latency_ms
    return result
