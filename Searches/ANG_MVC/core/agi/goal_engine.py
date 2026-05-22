"""
GoalEngine — hierarchical goal creation, intrinsic reward, and adaptive motivation.

Implements BabyAGI-style autonomous task decomposition:
  root_objective → subgoals → ranked task queue → execution order

Intrinsic reward weights goals by:
  - novelty (not seen before)
  - usefulness (linked to prior successful outcomes)
  - urgency (time-sensitive signals)
"""

import time
import logging
from typing import Optional

logger = logging.getLogger("ang.goal_engine")


class Goal:
    def __init__(self, goal_id: str, description: str, parent_id: Optional[str] = None,
                 priority: float = 0.5, intrinsic_reward: float = 0.5):
        self.goal_id = goal_id
        self.description = description
        self.parent_id = parent_id
        self.priority = priority          # 0.0 – 1.0
        self.intrinsic_reward = intrinsic_reward
        self.status = "pending"           # pending | active | completed | failed
        self.created_at = time.time()
        self.completed_at: Optional[float] = None
        self.subgoals: list[str] = []

    def to_dict(self) -> dict:
        return {
            "goal_id": self.goal_id,
            "description": self.description,
            "parent_id": self.parent_id,
            "priority": self.priority,
            "intrinsic_reward": self.intrinsic_reward,
            "status": self.status,
            "subgoals": self.subgoals,
        }


class GoalEngine:
    def __init__(self):
        self._goals: dict[str, Goal] = {}
        self._counter = 0

    def _new_id(self) -> str:
        self._counter += 1
        return f"goal_{self._counter:04d}"

    # ------------------------------------------------------------------ #
    #  Goal creation                                                       #
    # ------------------------------------------------------------------ #

    def create_goal(self, description: str, parent_id: Optional[str] = None,
                    priority: float = 0.5) -> Goal:
        """Create a new goal, optionally as a subgoal of an existing one."""
        goal_id = self._new_id()
        # Novelty boost: if no similar description exists, raise intrinsic reward
        novelty = self._novelty_score(description)
        reward = min(1.0, priority * 0.5 + novelty * 0.5)
        goal = Goal(goal_id, description, parent_id, priority, reward)
        self._goals[goal_id] = goal
        if parent_id and parent_id in self._goals:
            self._goals[parent_id].subgoals.append(goal_id)
        logger.info("goal created: %s — %s", goal_id, description[:60])
        return goal

    def decompose(self, root_description: str, subgoal_descriptions: list[str]) -> Goal:
        """Create a root goal and decompose it into subgoals."""
        root = self.create_goal(root_description, priority=0.9)
        for desc in subgoal_descriptions:
            self.create_goal(desc, parent_id=root.goal_id, priority=0.6)
        return root

    # ------------------------------------------------------------------ #
    #  Execution queue                                                     #
    # ------------------------------------------------------------------ #

    def next_goal(self) -> Optional[Goal]:
        """Return the highest-priority pending goal."""
        pending = [g for g in self._goals.values() if g.status == "pending"]
        if not pending:
            return None
        return max(pending, key=lambda g: g.priority * g.intrinsic_reward)

    def complete_goal(self, goal_id: str, success: bool = True):
        if goal_id in self._goals:
            g = self._goals[goal_id]
            g.status = "completed" if success else "failed"
            g.completed_at = time.time()
            # Propagate reward to parent
            if g.parent_id and g.parent_id in self._goals:
                parent = self._goals[g.parent_id]
                if success:
                    parent.intrinsic_reward = min(1.0, parent.intrinsic_reward + 0.05)

    # ------------------------------------------------------------------ #
    #  Introspection                                                       #
    # ------------------------------------------------------------------ #

    def snapshot(self) -> dict:
        counts = {"pending": 0, "active": 0, "completed": 0, "failed": 0}
        for g in self._goals.values():
            counts[g.status] = counts.get(g.status, 0) + 1
        next_g = self.next_goal()
        return {
            "total_goals": len(self._goals),
            "status_counts": counts,
            "next_goal": next_g.to_dict() if next_g else None,
        }

    def _novelty_score(self, description: str) -> float:
        """Simple novelty: 1.0 if no similar goal exists, lower if duplicate."""
        desc_lower = description.lower()
        for g in self._goals.values():
            if g.description.lower() == desc_lower:
                return 0.1
        return 1.0
