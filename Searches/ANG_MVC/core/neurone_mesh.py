"""
Neurone Mesh — orchestration core.

Responsibilities:
  - Load and call the correct runtime adapter
  - Record observations into WorldModel
  - Feed outcomes to MetaCognition self-model
  - Structured logging on every inference
"""

import logging
import time
from typing import Awaitable, Callable

from core.quantum_router import get_registry
from core.state import state

logger = logging.getLogger("ang.neurone_mesh")

InferFn = Callable[[str], Awaitable[dict]]


async def _get_infer_fn(adapter_id: str) -> InferFn:
    """
    v3 Warm path (preferred):
      - Uses WarmAdapterPool if initialized (sub-5ms after first load)
    Fallback (v2 behavior):
      - Dynamic import every call (slower on cold starts)
    """
    if state.adapter_pool is not None:
        try:
            return await state.adapter_pool.get(adapter_id)
        except Exception as exc:
            logger.warning("adapter_pool.get failed for %s — falling back to dynamic load: %s", adapter_id, exc)

    # === Legacy dynamic loader (kept for compatibility) ===
    registry = get_registry()
    adapters = registry.get("adapters", [])
    adapter = next((a for a in adapters if a["id"] == adapter_id), None)
    if not adapter:
        logger.warning("adapter '%s' not found — falling back to stub", adapter_id)
        adapter = next((a for a in adapters if a["id"] == "runtime_adapter_stub"), None)

    if not adapter:
        raise RuntimeError("No adapters available in registry")

    import importlib
    module_name, fn_name = adapter["entrypoint"].split(":")
    module = importlib.import_module(module_name)
    fn = getattr(module, fn_name)

    # Make sure it's awaitable
    if not hasattr(fn, "__call__"):
        raise RuntimeError(f"Adapter {adapter_id} has no callable infer function")

    return fn


async def run_neurone_mesh(
    runtime_id: str,
    prompt: str,
    mode: str = "infer",
) -> dict:
    """
    Core execution path (v3 optimized):
      get warm adapter (pool or dynamic) → infer → observe → record outcome → return
    """
    t0 = time.perf_counter()
    infer_fn = await _get_infer_fn(runtime_id)

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
