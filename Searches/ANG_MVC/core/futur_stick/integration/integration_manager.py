"""
IntegrationManager — Autonomous Execution Loop (Roadmap Item 6)

This is the "heartbeat" of the pro-level AGI.

It runs the full pipeline continuously:
1. Pull latest snapshot (StreamCollector)
2. Encode + train NeuralManifold
3. Run massive parallel universe simulations
4. Plan using GoalPlanner
5. Optionally trigger CodeScribe for self-writing
6. Feed results to the Living Singularity Kernel
7. Track metrics

Designed to be started as the main loop for the entire ANC system.
"""

import asyncio
import time
from typing import Optional
from pathlib import Path

try:
    from core.futur_stick.monitoring.stream_collector import StreamCollector
    from core.futur_stick.manifold.neural_manifold import NeuralManifold
    from core.futur_stick.simulation.universe_simulator import UniverseSimulator
    from core.futur_stick.planner.goal_planner import GoalPlanner
    from core.futur_stick.codegen.code_scribe import CodeScribe
    from core.futur_stick.tools.tool_executor import ToolExecutor
    from core.futur_stick.meta.meta_learner import MetaLearner
    from core.neural_brain.ANC_LivingSingularityKernel import get_living_singularity_kernel
except Exception as e:
    print(f"[IntegrationManager] Import warning: {e}")


class IntegrationManager:
    def __init__(self):
        self.collector = StreamCollector(interval=1.0)
        self.manifold = NeuralManifold()
        self.simulator = UniverseSimulator()
        self.planner = GoalPlanner()
        self.scribe = CodeScribe()
        self.executor = ToolExecutor()
        self.meta_learner = MetaLearner()
        self.kernel = get_living_singularity_kernel()
        self.running = False
        self.metrics = {"pulses": 0, "code_written": 0, "avg_novelty": 0.0}

    async def run_loop(self, interval: float = 3.0, max_pulses: Optional[int] = None):
        """The main autonomous sense-think-act loop."""
        print("[IntegrationManager] Starting full pro-level autonomous loop...")
        self.running = True
        count = 0

        while self.running:
            try:
                # 1. Perception
                snapshot = self.collector.get_snapshot()

                # 2. Encode + online learn
                latent = self.manifold.get_latent(snapshot)
                next_snap = self.collector.get_snapshot()
                loss = self.manifold.train_step(snapshot, next_snap)

                # 3. Massive parallel simulation
                sim_result = self.simulator.simulate(latent)
                best_decision = sim_result["top_decisions"][0] if sim_result["top_decisions"] else {}

                # 4. Planning
                goal = "Continuously improve performance and evolve capabilities"
                plan = self.planner.plan(goal, best_decision.get("decision_vector"))

                # 5. Self-writing code (when high novelty)
                if best_decision.get("novelty", 0) > 0.00005:
                    written_file = self.scribe.generate_from_decision(best_decision, goal)
                    self.metrics["code_written"] += 1

                    # 5.1 Secure execution of generated code
                    if written_file:
                        exec_result = self.executor.execute_generated_module(written_file)
                        print(f"    [Executor] Generated code execution: {exec_result.get('status')}")

                # 6. Feed to the master kernel
                kernel_result = self.kernel.pulse_consciousness(snapshot)

                # 7. Record metrics and self-tune
                pulse_data = {
                    "best_decision": best_decision,
                    "consciousness_level": kernel_result.get("consciousness_level", 0),
                    "loss": loss,
                    "code_written": self.metrics["code_written"]
                }
                self.meta_learner.record_metrics(pulse_data)
                tune_result = self.meta_learner.self_tune()

                self.metrics["pulses"] += 1
                self.metrics["avg_novelty"] = (
                    0.9 * self.metrics["avg_novelty"] + 0.1 * best_decision.get("novelty", 0)
                )

                print(f"[Pulse {self.metrics['pulses']}] Novelty={best_decision.get('novelty',0):.6f} "
                      f"Loss={loss:.4f} CodeFiles={self.metrics['code_written']} "
                      f"KernelConsciousness={kernel_result['consciousness_level']:.5f} "
                      f"Tune={tune_result.get('status', 'ok')}")

                if max_pulses and count >= max_pulses:
                    break
                count += 1

                await asyncio.sleep(interval)

            except Exception as e:
                print(f"[IntegrationManager] Loop error (recovering): {e}")
                await asyncio.sleep(2)

    def stop(self):
        self.running = False
        print("[IntegrationManager] Loop stopped.")

    def get_metrics(self):
        return {
            **self.metrics,
            "meta_status": self.meta_learner.get_status()
        }
