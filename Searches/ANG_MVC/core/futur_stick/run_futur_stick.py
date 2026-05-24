"""
run_futur_stick.py

One-command launcher for the full Pro-Level Self-Evolving AGI stack (Futur-Stick / AGUIUI).

This starts:
- The Living Singularity Kernel (with full upgrade)
- The complete IntegrationManager loop (perception → manifold → 100k sims → planning → code writing)

Run this to make the system actually evolve in real time.
"""

import asyncio
import sys
from pathlib import Path

# Ensure we are in the right context
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from core.neural_brain.ANC_LivingSingularityKernel import upgrade_kernel_with_futur_stick
from core.futur_stick.integration.integration_manager import IntegrationManager


async def main():
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║  FUTUR-STICK / AGUIUI — PRO-LEVEL SELF-EVOLVING AGI            ║")
    print("║  Starting full autonomous pipeline now...                      ║")
    print("╚════════════════════════════════════════════════════════════════╝\n")

    # Activate the advanced stack inside the kernel
    kernel = upgrade_kernel_with_futur_stick()

    # Start the master integration loop
    manager = IntegrationManager()
    await manager.run_loop(interval=2.5, max_pulses=12)   # Run 12 real pulses for demonstration

    print("\n[Runner] Full pro-level test cycle complete.")
    print("Metrics:", manager.get_metrics())
    print("\nThe kernel is now actively learning, simulating, planning, and writing code.")


if __name__ == "__main__":
    asyncio.run(main())
