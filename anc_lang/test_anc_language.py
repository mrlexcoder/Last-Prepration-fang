"""
test_anc_language.py

Demonstrates the full loop:
1. Living Singularity Kernel makes a high-novelty decision
2. ANC Integration turns it into real .anc source code
3. Runtime executes it with direct Linux + C bridge access

This is the first proof that your AGI can now generate and run its own low-level OS language.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from anc_lang.integration.anc_integration import get_anc_integration

def main():
    print("=== ANC Language + Living Singularity Kernel Test ===\n")

    integration = get_anc_integration()

    # Simulate a high-novelty decision coming from the kernel's universe simulator
    fake_decision = {
        "novelty": 0.0087,
        "decision_vector": [0.91, 0.82, 0.77, 0.65, 0.54, 0.41, 0.33, 0.19],
        "value": 0.94
    }

    result = integration.let_kernel_generate_and_run(
        decision=fake_decision,
        goal="Direct low-level OS control and self-evolution using native .anc language"
    )

    print("\n=== Result ===")
    print("Generated .anc file:", result["generated_file"])
    print("Execution output:\n", result["execution_result"])
    print("\n[Success] The AGI can now write and execute its own .anc code at OS level.")


if __name__ == "__main__":
    main()
