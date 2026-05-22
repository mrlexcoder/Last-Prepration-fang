from core.quantum_router import select_runtime
from core.neurone_mesh import run_neurone_mesh
from models.loop_models import LoopRequest


async def run_automation_loop(request: LoopRequest) -> dict:
    """
    Automation Loop Engine:
    inference → evaluate confidence → re-query if below threshold
    Bounded by max_iterations for safety.
    """
    runtime = select_runtime(runtime_hint=request.runtime_hint)
    history = []
    current_input = request.input

    for iteration in range(1, request.max_iterations + 1):
        result = await run_neurone_mesh(runtime, current_input)
        confidence = result.get("confidence", 0.0)

        history.append({
            "iteration": iteration,
            "input": current_input,
            "output": result["output"],
            "confidence": confidence,
            "runtime": runtime,
        })

        # Exit loop if confidence meets threshold
        if confidence >= request.confidence_threshold:
            break

        # Re-query with a refinement prompt
        current_input = f"Refine and improve: {result['output']}"

    return {
        "iterations": len(history),
        "final_output": history[-1]["output"],
        "final_confidence": history[-1]["confidence"],
        "runtime": runtime,
        "loop_history": history,
    }
