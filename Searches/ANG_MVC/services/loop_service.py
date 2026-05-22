"""
Automation Loop Engine
  inference → evaluate confidence → MetaCognition reflect → cache store → re-query

Safety bounds: max_iterations, confidence_threshold, rate controls.
"""

import logging
from core.quantum_router import select_runtime
from core.neurone_mesh import run_neurone_mesh
from models.loop_models import LoopRequest

logger = logging.getLogger("ang.loop_service")


async def run_automation_loop(request: LoopRequest) -> dict:
    runtime = select_runtime(runtime_hint=request.runtime_hint)
    history = []
    current_input = request.input

    # Pull AGI singletons — graceful if not initialised
    from core.state import state
    cache = state.cache
    meta = state.meta_cognition

    for iteration in range(1, request.max_iterations + 1):
        result = await run_neurone_mesh(runtime, current_input, mode="loop")
        confidence = result.get("confidence", 0.0)
        output = result.get("output", "")

        history.append({
            "iteration": iteration,
            "input": current_input,
            "output": output,
            "confidence": confidence,
            "runtime": runtime,
        })

        logger.info("loop iter=%d confidence=%.2f", iteration, confidence)

        # MetaCognition: reflect on this iteration
        if meta and iteration > 1:
            prev_output = history[-2]["output"]
            meta.reflect(
                action=f"loop_iter_{iteration}",
                expected=prev_output[:80],
                actual=output[:80],
                confidence=confidence,
            )

        # Store each iteration output in InfinityCache
        if cache:
            cache.store(
                text=f"Loop Q: {current_input}\nA: {output}",
                summary=output[:120],
            )

        # Exit if confidence threshold met
        if confidence >= request.confidence_threshold:
            logger.info("loop exiting early at iter=%d (confidence=%.2f >= %.2f)",
                        iteration, confidence, request.confidence_threshold)
            break

        # Refinement prompt for next iteration
        current_input = f"Refine and improve this answer: {output}"

    return {
        "iterations": len(history),
        "final_output": history[-1]["output"],
        "final_confidence": history[-1]["confidence"],
        "runtime": runtime,
        "loop_history": history,
    }
