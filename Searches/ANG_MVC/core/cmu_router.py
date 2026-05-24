"""
Cognitive Motor Unit (CMU) Router — v3 Pro
Implements human-muscle-like recruitment:
- CMU-0: Spinal reflex (exact cache hit, <1ms)
- CMU-1: Fine motor (simple factual, single fast model)
- CMU-2: Coordinated (multi-step CoT + critic)
- CMU-3: Power ensemble (full multi-agent parallel calculations)
- CMU-4: Neuroplastic (post-hoc learning, async)

Decides at runtime whether to do single inference or multiple parallel calculations (ensemble + debate).
Fully integrated with ANG memory, complexity scoring, and pro AGI loop.
"""

import asyncio
import logging
import re
import time
from typing import Optional, Dict, Any

logger = logging.getLogger("ang.cmu_router")


class CognitiveMotorRouter:
    """
    Pro-level router that selects execution stance based on query complexity.
    Enables 'multiple calculation based' thinking only when the query justifies the cost.
    """

    CMU_LEVELS = {
        0: "reflex",      # exact hit, instant
        1: "fast",        # single model, direct
        2: "cot",         # chain + critic (2 calculations)
        3: "ensemble",    # 4-5 parallel agents + synth (multiple calculations)
        4: "full_agi",    # full 10-step: curiosity, counterfactual, reflexion, agentscope etc.
    }

    def __init__(self, cache=None, meta=None, world_model=None):
        self.cache = cache
        self.meta = meta
        self.world_model = world_model
        self._complexity_cache: Dict[str, float] = {}  # simple query -> score memo

    def _score_complexity(self, query: str, context: str = "") -> float:
        """
        0.0 = trivial
        1.0 = extremely complex, high-stakes, novel, multi-hop
        """
        q = query.lower().strip()
        if not q:
            return 0.1

        # Memoize for speed
        key = q[:120]
        if key in self._complexity_cache:
            return self._complexity_cache[key]

        score = 0.0

        # Length signals depth
        words = len(q.split())
        score += min(words / 40.0, 0.35)

        # Uncertainty / open-ended language (requires reasoning)
        uncertainty = ["how", "why", "what if", "explain", "compare", "analyze", "should", "best way", "tradeoff", "improve", "design", "strategy", "prove", "derive"]
        for kw in uncertainty:
            if kw in q:
                score += 0.12

        # Multi-part or conditional
        if any(c in q for c in [" and ", " or ", " but ", " if ", " when ", ";", " vs ", " versus "]):
            score += 0.15

        # Numbers / calculations / optimization
        if re.search(r"\d+[%$]?", q) or any(w in q for w in ["calculate", "optimize", "maximize", "minimize", "probability", "estimate"]):
            score += 0.18

        # Novel / creative / counterfactual language
        if any(w in q for w in ["imagine", "suppose", "what if", "counterfactual", "alternative", "future", "long term"]):
            score += 0.22

        # High-stakes / decision / planning
        if any(w in q for w in ["decide", "plan", "recommend", "choose", "risk", "invest", "medical", "legal", "critical"]):
            score += 0.20

        # Context size (previous turns make it harder)
        ctx_words = len(context.split()) if context else 0
        score += min(ctx_words / 300.0, 0.25)

        # Penalize very short trivial queries
        if words < 5 and not any(kw in q for kw in ["how", "why", "what if"]):
            score -= 0.25

        # Cap
        final = max(0.0, min(1.0, round(score, 3)))
        self._complexity_cache[key] = final
        return final

    async def _exact_hit(self, query: str) -> bool:
        """Check for instant reflex hit in cache (CMU-0)."""
        if not self.cache:
            return False
        try:
            # Use fast sync search if available
            hits = self.cache.search(query, top_k=1) if hasattr(self.cache, "search") else []
            if hits and len(hits) > 0:
                top = hits[0]
                sim = top.get("score", 0.0) if isinstance(top, dict) else getattr(top, "score", 0.0)
                if sim > 0.96 or (isinstance(top, dict) and top.get("summary", "").startswith("[exact]")):
                    return True
        except Exception:
            pass
        return False

    async def route(self, query: str, context: str = "", user_id: str = "default", force_level: Optional[int] = None) -> Dict[str, Any]:
        """
        Returns routing decision:
        {
            "cmu": 0|1|2|3|4,
            "level": "reflex" | ...,
            "use_ensemble": bool,
            "use_full_agi": bool,
            "complexity": float,
            "reason": str
        }
        """
        t0 = time.perf_counter()

        if force_level is not None:
            cmu = max(0, min(4, force_level))
            complexity = 0.5
            reason = f"forced_cmu_{cmu}"
        else:
            if await self._exact_hit(query):
                cmu = 0
                complexity = 0.0
                reason = "exact_cache_reflex"
            else:
                complexity = self._score_complexity(query, context)
                if complexity < 0.22:
                    cmu = 0   # even more aggressive reflex/fast
                    reason = "very_low_complexity_fast_neural_approx"
                elif complexity < 0.55:
                    cmu = 2
                    reason = "medium_complexity_cot_critic"
                elif complexity < 0.82:
                    cmu = 3
                    reason = "high_complexity_multi_calc_ensemble"
                else:
                    cmu = 4
                    reason = "very_high_complexity_full_agi_loop"

        decision = {
            "cmu": cmu,
            "level": self.CMU_LEVELS[cmu],
            "use_ensemble": cmu >= 3,
            "use_full_agi": cmu >= 4,
            "complexity": complexity,
            "reason": reason,
            "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
        }

        logger.info("CMU route: cmu=%s complexity=%.2f reason=%s q=%s", cmu, complexity, reason, query[:60])
        return decision

    def get_cmu_description(self, cmu: int) -> str:
        return self.CMU_LEVELS.get(cmu, "unknown")
