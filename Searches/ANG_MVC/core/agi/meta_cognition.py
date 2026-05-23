"""
MetaCognition — self-observation, belief revision, and recursive plan critique.

Implements Reflexion-style self-critique:
  execute → observe outcome → critique → revise belief → update strategy

Tracks:
  - self_model: compact representation of system capabilities and recent performance
  - belief_store: confidence-weighted beliefs about the world and own performance
  - reflection_log: history of critiques and revisions
"""

import asyncio
import time
import logging
from typing import Optional

logger = logging.getLogger("ang.meta_cognition")


class MetaCognition:
    def __init__(self):
        # belief_store: {belief_key: {value, confidence, last_updated}}
        self._beliefs: dict[str, dict] = {}
        # self_model: rolling performance stats per runtime/mode
        self._self_model: dict[str, dict] = {}
        # reflection log
        self._reflections: list[dict] = []

    # ------------------------------------------------------------------ #
    #  Belief management                                                   #
    # ------------------------------------------------------------------ #

    def update_belief(self, key: str, value: any, confidence: float = 0.7):
        """Set or revise a belief with a confidence score."""
        old = self._beliefs.get(key)
        if old:
            # Bayesian-style blend: weighted average of old and new confidence
            blended = old["confidence"] * 0.4 + confidence * 0.6
            self._beliefs[key] = {"value": value, "confidence": round(blended, 3),
                                   "last_updated": time.time()}
        else:
            self._beliefs[key] = {"value": value, "confidence": confidence,
                                   "last_updated": time.time()}
        logger.debug("belief updated: %s = %s (conf=%.2f)", key, str(value)[:40], confidence)

    def get_belief(self, key: str) -> Optional[dict]:
        return self._beliefs.get(key)

    # ------------------------------------------------------------------ #
    #  Self-model update                                                   #
    # ------------------------------------------------------------------ #

    def record_outcome(self, runtime: str, mode: str, confidence: float,
                       latency_ms: float, success: bool):
        """Update the self-model after an inference cycle completes."""
        k = f"{runtime}:{mode}"
        if k not in self._self_model:
            self._self_model[k] = {
                "calls": 0, "successes": 0,
                "avg_confidence": 0.0, "avg_latency_ms": 0.0,
            }
        sm = self._self_model[k]
        n = sm["calls"]
        sm["calls"] += 1
        sm["successes"] += int(success)
        sm["avg_confidence"] = (sm["avg_confidence"] * n + confidence) / (n + 1)
        sm["avg_latency_ms"] = (sm["avg_latency_ms"] * n + latency_ms) / (n + 1)

    def best_runtime(self) -> Optional[str]:
        """Return the runtime:mode key with highest success rate."""
        if not self._self_model:
            return None
        return max(
            self._self_model,
            key=lambda k: (
                self._self_model[k]["successes"] / max(1, self._self_model[k]["calls"])
            ),
        )

    # ------------------------------------------------------------------ #
    #  Reflection (Reflexion-style)                                        #
    # ------------------------------------------------------------------ #

    def reflect(self, action: str, expected: str, actual: str,
                confidence: float) -> dict:
        """
        Compare expected vs actual outcome.
        Generate a critique and update beliefs accordingly.
        """
        match = expected.lower() in actual.lower() if expected else True
        critique = (
            "Outcome matched expectation." if match
            else f"Mismatch: expected '{expected[:60]}' but got '{actual[:60]}'"
        )
        revised_confidence = confidence * (1.0 if match else 0.7)
        self.update_belief(f"action:{action}", actual, revised_confidence)

        entry = {
            "action": action,
            "expected": expected,
            "actual": actual,
            "match": match,
            "critique": critique,
            "revised_confidence": round(revised_confidence, 3),
            "timestamp": time.time(),
        }
        self._reflections.append(entry)
        logger.info("reflection: %s", critique)
        return entry

    # ------------------------------------------------------------------ #
    #  Introspection                                                       #
    # ------------------------------------------------------------------ #

    def snapshot(self) -> dict:
        return {
            "beliefs": len(self._beliefs),
            "self_model_keys": list(self._self_model.keys()),
            "reflections": len(self._reflections),
            "best_runtime": self.best_runtime(),
            "recent_critiques": [r["critique"] for r in self._reflections[-3:]],
        }

    # ------------------------------------------------------------------ #
    #  v3 Pro Full Reflexion + Multi-Calc Belief Revision                 #
    # ------------------------------------------------------------------ #

    async def full_reflect(self, prompt: str, response: str, outcome_metrics: dict,
                           infer_fn=None, world_model=None) -> dict:
        """
        Pro-level Reflexion:
        1. Critique own answer
        2. Run counterfactuals on key claims (multiple simulations)
        3. Update beliefs + curiosity
        4. Emit learning signal if high quality
        """
        critique = outcome_metrics.get("critique", "No external critique provided.")
        confidence = outcome_metrics.get("confidence", 0.6)
        goal_alignment = outcome_metrics.get("goal_alignment", 0.5)
        novelty = outcome_metrics.get("novelty", 0.5)

        # Auto-critique using model if provided (for full AGI loop)
        if infer_fn and len(response) > 20:
            try:
                critique_prompt = f"Critique this answer rigorously for accuracy, completeness, and reasoning flaws:\n\nQuestion: {prompt}\n\nAnswer: {response}\n\nCritique:"
                if asyncio.iscoroutinefunction(infer_fn):
                    crit_result = await infer_fn(critique_prompt)
                else:
                    crit_result = infer_fn(critique_prompt)
                if isinstance(crit_result, dict):
                    critique = crit_result.get("output", critique)
                else:
                    critique = str(crit_result)
            except Exception:
                pass

        # Belief revision
        self.update_belief("last_response_confidence", confidence, confidence)
        self.update_belief("last_critique", critique[:200], 0.8)

        # Counterfactual on the response if world_model available
        cf_results = []
        if world_model:
            try:
                cf = world_model.counterfactual("last_inference", {"node": "confidence", "new_value": round(confidence * 0.8, 2)})
                cf_results = cf.get("parallel_paths", [])[:2]
            except Exception:
                pass

        entry = {
            "prompt": prompt[:120],
            "response": response[:200],
            "critique": critique[:300],
            "revised_confidence": round(confidence * (0.7 + 0.3 * goal_alignment), 3),
            "curiosity_triggered": novelty > 0.7,
            "counterfactuals_run": len(cf_results),
            "timestamp": time.time(),
        }
        self._reflections.append(entry)

        # Learning signal quality gate (for online training)
        quality = (confidence * 0.4 + goal_alignment * 0.3 + novelty * 0.2 + (1 if len(cf_results) > 0 else 0) * 0.1)
        if quality >= 0.82:
            entry["high_quality_learning_signal"] = True

        logger.info("full_reflect: quality=%.2f cf=%d", quality, len(cf_results))
        return entry
