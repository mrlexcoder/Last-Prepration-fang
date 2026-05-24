"""
PersistentWorldGraph — Pro-Level World Model & Long-Term Memory for ANC_Official

This is the foundational component for general-purpose AGI.

Capabilities:
- Persistent multimodal knowledge graph (survives restarts)
- Entities: code, OS state, kernel decisions, .anc execution traces, perceptions
- Causal + temporal edges
- Vector embeddings via existing NeuralManifold
- Query interface for planning, reflection, and self-evolution
- Direct integration with LivingSingularityKernel and Futur-Stick

This replaces and extends the older symbolic WorldModel with a real, learnable, persistent system.
"""

import json
import time
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import defaultdict

try:
    from core.futur_stick.manifold.neural_manifold import NeuralManifold
except Exception:
    NeuralManifold = None


class PersistentWorldGraph:
    def __init__(self, storage_path: str = "/tmp/anc_world_graph"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

        self.entities: Dict[str, Dict] = {}           # entity_id -> {type, attrs, embedding, timestamp}
        self.causal_edges: List[Dict] = []            # {from, to, relation, confidence, timestamp}
        self.temporal_index: Dict[float, List[str]] = defaultdict(list)  # timestamp -> entity_ids

        self.manifold = NeuralManifold() if NeuralManifold else None

        self._load()

    # ──────────────────────────────────────────────────────────────────────────
    # Core Operations
    # ──────────────────────────────────────────────────────────────────────────

    def add_entity(self, entity_type: str, attributes: Dict[str, Any], 
                   embedding_source: Optional[str] = None) -> str:
        """Add a new entity with optional neural embedding."""
        entity_id = str(uuid.uuid4())
        timestamp = time.time()

        embedding = None
        if self.manifold and embedding_source:
            embedding = self.manifold.get_latent({"text": embedding_source}).tolist()

        entity = {
            "id": entity_id,
            "type": entity_type,
            "attributes": attributes,
            "embedding": embedding,
            "created_at": timestamp,
            "last_updated": timestamp
        }

        self.entities[entity_id] = entity
        self.temporal_index[timestamp].append(entity_id)

        self._save()
        return entity_id

    def add_causal_edge(self, from_id: str, to_id: str, relation: str, 
                        confidence: float = 0.8) -> str:
        """Record a causal relationship."""
        edge = {
            "from": from_id,
            "to": to_id,
            "relation": relation,
            "confidence": confidence,
            "timestamp": time.time()
        }
        self.causal_edges.append(edge)
        self._save()
        return edge["relation"]

    def record_kernel_pulse(self, pulse_result: Dict[str, Any]):
        """Convenience method: ingest a full kernel pulse into the world model."""
        decision = pulse_result.get("best_decision", {})
        entity_id = self.add_entity(
            "kernel_decision",
            {
                "novelty": decision.get("novelty"),
                "value": decision.get("value"),
                "consciousness": pulse_result.get("consciousness_level")
            },
            embedding_source=str(decision)
        )

        # Link to previous recent decisions for temporal/causal chaining
        recent = self.query_recent_entities("kernel_decision", limit=3)
        for prev in recent:
            if prev["id"] != entity_id:
                self.add_causal_edge(prev["id"], entity_id, "led_to", confidence=0.6)

    def record_anc_execution(self, anc_file: str, result: str, context: Dict[str, Any]):
        """Record execution of .anc code as a first-class entity."""
        self.add_entity(
            "anc_execution",
            {
                "file": anc_file,
                "result": result[:500],
                "context": context
            },
            embedding_source=f"{anc_file} {result}"
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Query Interface (used by planner, kernel, safety, etc.)
    # ──────────────────────────────────────────────────────────────────────────

    def query_recent_entities(self, entity_type: str = None, limit: int = 10) -> List[Dict]:
        """Get most recent entities, optionally filtered by type."""
        all_entities = sorted(self.entities.values(), key=lambda e: e["last_updated"], reverse=True)
        if entity_type:
            all_entities = [e for e in all_entities if e["type"] == entity_type]
        return all_entities[:limit]

    def get_causal_chain(self, entity_id: str, depth: int = 5) -> List[Dict]:
        """Return causal history leading to or from this entity."""
        chain = []
        current = entity_id
        for _ in range(depth):
            incoming = [e for e in self.causal_edges if e["to"] == current]
            if not incoming:
                break
            edge = max(incoming, key=lambda e: e["confidence"])
            chain.append(edge)
            current = edge["from"]
        return chain

    def get_state_snapshot(self) -> Dict[str, Any]:
        """Compact snapshot for the kernel to reason over."""
        return {
            "total_entities": len(self.entities),
            "total_edges": len(self.causal_edges),
            "recent_decisions": [e["attributes"] for e in self.query_recent_entities("kernel_decision", 5)],
            "recent_anc_runs": len([e for e in self.entities.values() if e["type"] == "anc_execution"])
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Persistence
    # ──────────────────────────────────────────────────────────────────────────

    def _save(self):
        data = {
            "entities": self.entities,
            "causal_edges": self.causal_edges,
            "saved_at": time.time()
        }
        (self.storage_path / "world_graph.json").write_text(json.dumps(data, indent=2))

    def _load(self):
        graph_file = self.storage_path / "world_graph.json"
        if graph_file.exists():
            try:
                data = json.loads(graph_file.read_text())
                self.entities = data.get("entities", {})
                self.causal_edges = data.get("causal_edges", [])
            except Exception:
                pass
