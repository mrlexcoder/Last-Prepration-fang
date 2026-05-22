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
