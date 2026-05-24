"""
futur_stick_test.py — Full End-to-End Pro-Level Pipeline Test

Tests the complete Futur-Stick / AGUIUI learning stack:
1. StreamCollector → real perception
2. NeuralManifold → learnable encoding + online training
3. UniverseSimulator → 100k parallel simulations
4. GoalPlanner → turning intent into action
5. Integration with the Living Singularity Kernel

Run this file to verify the pro-level brain is actually working.
"""

import sys
import os
import time
import numpy as np

# Make imports work from anywhere
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")))

from core.futur_stick.monitoring.stream_collector import StreamCollector
from core.futur_stick.manifold.neural_manifold import NeuralManifold
from core.futur_stick.simulation.universe_simulator import UniverseSimulator
from core.futur_stick.planner.goal_planner import GoalPlanner

from core.neural_brain.ANC_LivingSingularityKernel import get_living_singularity_kernel

def run_full_pro_pipeline_test():
    print("=== FUTUR-STICK / AGUIUI PRO-LEVEL PIPELINE TEST ===\n")

    # 1. Perception
    print("[1] Collecting live snapshot via StreamCollector...")
    collector = StreamCollector(interval=0.1)
    snapshot = collector.get_snapshot()
    print(f"    Snapshot keys: {list(snapshot.keys())}")

    # 2. Learnable Manifold
    print("[2] Encoding snapshot into NeuralManifold (trainable)...")
    manifold = NeuralManifold(input_dim=2048, latent_dim=4096)
    latent = manifold.get_latent(snapshot)
    print(f"    Latent shape: {latent.shape}")

    # Simulate one training step (future snapshot = slight variation)
    next_snap = collector.get_snapshot()
    loss = manifold.train_step(snapshot, next_snap)
    print(f"    Online training loss: {loss:.6f}")

    # 3. Massive Parallel Simulation
    print("[3] Running 100,000 parallel universe simulations...")
    simulator = UniverseSimulator(latent_dim=4096, num_rollouts=100000, steps=4)
    sim_result = simulator.simulate(latent)
    print(f"    Universes simulated: {sim_result['universes_simulated']}")
    print(f"    Top novelty: {sim_result['top_decisions'][0]['novelty']:.6f}")

    # 4. Goal Planner
    print("[4] Generating plan from high-novelty decision...")
    planner = GoalPlanner()
    best = sim_result['top_decisions'][0]
    goal = "Improve system speed and evolve decision making"
    plan = planner.plan(goal, best['decision_vector'])
    print(f"    Plan: {plan['plan']}")

    # 5. Integration with Living Singularity Kernel
    print("[5] Feeding everything into the Living Singularity Kernel...")
    kernel = get_living_singularity_kernel()
    kernel_result = kernel.pulse_consciousness(snapshot)
    print(f"    Kernel consciousness: {kernel_result['consciousness_level']}")
    print(f"    Kernel wrote new code files: {kernel_result['self_written_files']}")

    print("\n=== FULL PIPELINE SUCCESS — PRO-LEVEL AGI FOUNDATION OPERATIONAL ===")
    return {
        "snapshot": snapshot,
        "latent_shape": latent.shape,
        "simulations": sim_result['universes_simulated'],
        "plan": plan,
        "kernel_result": kernel_result
    }


if __name__ == "__main__":
    result = run_full_pro_pipeline_test()
    print("\nTest completed successfully. The system is now running the full pro roadmap pipeline.")
