"""
WorldModel — structured state representation for ANG.

Tracks entities, relations, and events observed during inference cycles.
Supports causal edge recording and counterfactual queries.

This is the foundation layer for AGI-style reasoning:
  observation → state update → causal graph → simulation
"""

import time
import logging
from typing import Any, Optional

logger = logging.getLogger("ang.world_model")


class WorldModel:
    def __init__(self):
        # entity store: {entity_id: {type, attributes, last_seen}}
        self._entities: dict[str, dict] = {}
        # causal edges: list of {cause, effect, confidence, timestamp}
        self._causal_edges: list[dict] = []
        # event log: list of {event, timestamp, source}
        self._events: list[dict] = []

    # ------------------------------------------------------------------ #
    #  Observation ingestion                                               #
    # ------------------------------------------------------------------ #

    def observe(self, event: str, source: str = "system", metadata: Optional[dict] = None):
        """Record a raw observation into the event log."""
        entry = {
            "event": event,
            "source": source,
            "timestamp": time.time(),
            "metadata": metadata or {},
        }
        self._events.append(entry)
        logger.debug("world_model observed: %s", event[:80])

    def add_entity(self, entity_id: str, entity_type: str, attributes: Optional[dict] = None):
        """Register or update an entity in the world state."""
        self._entities[entity_id] = {
            "type": entity_type,
            "attributes": attributes or {},
            "last_seen": time.time(),
        }

    def add_causal_edge(self, cause: str, effect: str, confidence: float = 0.7):
        """Record a cause → effect relationship."""
        self._causal_edges.append({
            "cause": cause,
            "effect": effect,
            "confidence": confidence,
            "timestamp": time.time(),
        })

    # ------------------------------------------------------------------ #
    #  Queries                                                             #
    # ------------------------------------------------------------------ #

    def get_entity(self, entity_id: str) -> Optional[dict]:
        return self._entities.get(entity_id)

    def get_effects_of(self, cause: str) -> list[dict]:
        """Return all known effects of a given cause."""
        return [e for e in self._causal_edges if e["cause"] == cause]

    def simulate(self, action: str) -> dict:
        """
        Lightweight simulation: predict likely effects of an action
        by matching against known causal edges.
        Returns predicted outcomes with confidence scores.
        """
        effects = self.get_effects_of(action)
        if not effects:
            return {"action": action, "predicted_effects": [], "certainty": 0.0}
        avg_conf = sum(e["confidence"] for e in effects) / len(effects)
        return {
            "action": action,
            "predicted_effects": [e["effect"] for e in effects],
            "certainty": round(avg_conf, 3),
        }

    def snapshot(self) -> dict:
        return {
            "entities": len(self._entities),
            "causal_edges": len(self._causal_edges),
            "events": len(self._events),
            "recent_events": [e["event"] for e in self._events[-5:]],
        }

    # ------------------------------------------------------------------ #
    #  v3 Pro: Counterfactual Reasoning (Multiple Simulation Paths)       #
    # ------------------------------------------------------------------ #

    def counterfactual(self, event_id: str, intervention: dict) -> dict:
        """
        Pro AGI: What-if reasoning.
        Simulate alternate reality by changing one variable and propagating effects.
        Supports multiple calculation paths via forward simulation on causal graph.
        """
        # Find relevant causal subgraph
        relevant = [e for e in self._causal_edges if e["cause"] == event_id or e["effect"] == event_id]
        if not relevant:
            return {
                "original_event": event_id,
                "intervention": intervention,
                "simulated_outcomes": [],
                "certainty": 0.0,
                "note": "No causal data — pure hypothetical"
            }

        new_value = intervention.get("new_value")
        affected = []
        for edge in relevant:
            if edge["effect"] == event_id:
                # reverse influence estimate
                affected.append({
                    "node": edge["cause"],
                    "predicted_change": f"would affect cause of {event_id}",
                    "confidence": edge["confidence"] * 0.6
                })
            else:
                affected.append({
                    "node": edge["effect"],
                    "predicted_change": f"becomes {new_value} (was driven by {event_id})",
                    "confidence": edge["confidence"]
                })

        # Multiple forward simulation paths (simple branching)
        paths = []
        base_certainty = sum(e["confidence"] for e in relevant) / len(relevant)
        for i, eff in enumerate(affected[:3]):  # top 3 branches
            paths.append({
                "path_id": i + 1,
                "intervention": intervention,
                "outcome": f"If {event_id} set to {new_value} then {eff['node']} would {eff['predicted_change']}",
                "certainty": round(eff["confidence"] * base_certainty, 3)
            })

        return {
            "original_event": event_id,
            "intervention": intervention,
            "simulated_outcomes": affected,
            "parallel_paths": paths,
            "certainty": round(base_certainty, 3),
            "num_calculations": len(paths),
        }

    def run_multiple_simulations(self, base_event: str, interventions: list[dict]) -> list[dict]:
        """Run several counterfactuals in parallel for decision support (true multi-calc AGI)."""
        results = []
        for inter in interventions:
            results.append(self.counterfactual(base_event, inter))
        return results
