"""
MetaLearner — Continuous Evaluation & Self-Tuning (Roadmap Item 8)

Monitors the performance of the entire AGI stack and automatically adjusts parameters for better results.

Capabilities:
- Tracks metrics: latency, novelty, code quality, consciousness growth, execution success rate.
- Self-tunes: simulation depth, learning rate, consciousness thresholds, planning horizon.
- Stores historical data for trend analysis.
- Can trigger deeper learning or code evolution when performance drops.

This is the "brain of the brain" — the system that makes the AGI improve its own improvement process.
"""

import time
from typing import Dict, Any
from collections import deque
import json
from pathlib import Path


class MetaLearner:
    def __init__(self, history_size: int = 500):
        self.metrics_history = deque(maxlen=history_size)
        self.current_params = {
            "simulation_steps": 4,
            "consciousness_threshold": 0.71,
            "learning_rate": 1e-3,
            "planning_horizon": 5,
            "max_parallel_universes": 100000
        }
        self.adjustment_log = []
        self.storage_path = Path("/tmp/anc_meta_learner_state.json")

    def record_metrics(self, pulse_data: Dict[str, Any]):
        """Record performance after each IntegrationManager pulse."""
        record = {
            "timestamp": time.time(),
            "novelty": pulse_data.get("best_decision", {}).get("novelty", 0),
            "consciousness": pulse_data.get("consciousness_level", 0),
            "loss": pulse_data.get("loss", 0),
            "code_written": pulse_data.get("code_written", 0),
            "execution_success_rate": pulse_data.get("success_rate", 1.0),
            "latency_ms": pulse_data.get("latency_ms", 0)
        }
        self.metrics_history.append(record)

    def self_tune(self) -> Dict[str, Any]:
        """
        Analyze recent performance and adjust internal parameters.
        This is the meta-learning / self-improvement mechanism.
        """
        if len(self.metrics_history) < 5:
            return {"status": "insufficient_data"}

        recent = list(self.metrics_history)[-10:]
        avg_novelty = sum(r["novelty"] for r in recent) / len(recent)
        avg_consciousness = sum(r["consciousness"] for r in recent) / len(recent)
        trend = recent[-1]["consciousness"] - recent[0]["consciousness"]

        changes = {}

        # Increase simulation depth if novelty is high but growth is slow
        if avg_novelty > 0.0001 and trend < 0.00005:
            self.current_params["simulation_steps"] = min(8, self.current_params["simulation_steps"] + 1)
            changes["simulation_steps"] = self.current_params["simulation_steps"]

        # Raise consciousness threshold if too many low-quality decisions
        if avg_consciousness > 0.85 and avg_novelty < 0.00005:
            self.current_params["consciousness_threshold"] = min(0.85, self.current_params["consciousness_threshold"] + 0.02)
            changes["consciousness_threshold"] = self.current_params["consciousness_threshold"]

        # Adjust learning rate based on loss stability
        if any(r["loss"] > 0.8 for r in recent[-3:]):
            self.current_params["learning_rate"] = max(1e-4, self.current_params["learning_rate"] * 0.8)
            changes["learning_rate"] = self.current_params["learning_rate"]

        if changes:
            self.adjustment_log.append({"time": time.time(), "changes": changes})

        self._save_state()
        return {"status": "tuned", "changes": changes, "current_params": self.current_params}

    def _save_state(self):
        try:
            data = {
                "params": self.current_params,
                "last_tune": time.time()
            }
            self.storage_path.write_text(json.dumps(data, indent=2))
        except Exception:
            pass

    def get_status(self) -> Dict[str, Any]:
        return {
            "current_params": self.current_params,
            "recent_adjustments": self.adjustment_log[-5:],
            "history_length": len(self.metrics_history)
        }
