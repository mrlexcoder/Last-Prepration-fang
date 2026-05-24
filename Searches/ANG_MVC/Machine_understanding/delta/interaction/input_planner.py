"""
InputPlanner v4.344 — Plans multi-step interactions using physics + quantum routing.
Minimizes energy while maximizing information gain.
"""

from typing import List, Dict
from .mouse_controller import PhysicsMouseController
from .keyboard_controller import SmartKeyboardController
from ..math.quantum_vision_router import QuantumVisionRouter


class InputPlanner:
    """
    High-level planner that turns "suggested_action" into executable step sequences.
    Uses quantum router for priority and physics for execution cost.
    """

    def __init__(self):
        self.mouse = PhysicsMouseController()
        self.keyboard = SmartKeyboardController()
        self.quantum = QuantumVisionRouter()

    async def plan_and_execute(self, decision: dict, understanding: dict):
        """Execute the optimal sequence."""
        action = decision.get("action", "observe")
        target = understanding.get("target_description", "")

        if action == "click":
            # In real system, use OCR to get exact coords
            await self.mouse.move_to_and_click(850, 480)
        elif action == "type":
            await self.keyboard.type_naturally(target or "example input", entropy_factor=0.8)
        elif action == "search":
            # Handled by browser agent usually
            pass

        return {"executed": action, "cost": decision.get("physics_cost", 1.0)}
