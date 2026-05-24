"""
GoalPlanner — Goal-Conditioned Planner (Roadmap Item 4)

Converts high-level goals (from user, curiosity, or meta-learner) into concrete action plans.

Plans are sequences of tool calls + optional code generation steps.
For Phase 1 we use a simple but effective rule + embedding-based matcher.
Later versions will use a trained decoder.
"""

from typing import Dict, Any, List
import numpy as np


class GoalPlanner:
    def __init__(self):
        self.tool_registry = [
            "edit_code", "run_command", "train_adapter", "desktop_click",
            "open_browser", "write_file", "generate_from_concept"
        ]

    def plan(self, goal: str, latent_state: np.ndarray = None) -> Dict[str, Any]:
        goal_lower = goal.lower()
        actions = []

        if any(k in goal_lower for k in ["speed", "optimize", "faster", "latency"]):
            actions.append({"tool": "edit_code", "target": "core/fast_decision_engine.py", "intent": "reduce target_latency"})
        if any(k in goal_lower for k in ["learn", "improve", "evolve"]):
            actions.append({"tool": "train_adapter", "intent": "self_improvement"})
        if any(k in goal_lower for k in ["write", "create", "generate"]):
            actions.append({"tool": "generate_from_concept", "intent": "auto_code"})
        if not actions:
            actions.append({"tool": "run_command", "intent": "general_exploration"})

        return {
            "goal": goal,
            "plan": actions,
            "estimated_steps": len(actions),
            "requires_code_generation": "generate" in goal_lower or "write" in goal_lower,
        }
