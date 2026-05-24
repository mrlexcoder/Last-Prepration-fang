"""
neural_brain — The Pro-Level Living Neural Brain for ANC_Official

This package now contains the actual functional Singularity Kernel.

Primary entry point:
    from core.neural_brain import get_living_singularity_kernel, inject_into_existing_anc

The kernel can now:
- Encrypt the live system
- Run 100k parallel simulations
- Autonomously write real Python code
- Run as the central consciousness loop

Run the kernel directly:
    python -m core.neural_brain.ANC_LivingSingularityKernel
"""

from .ANC_LivingSingularityKernel import (
    get_living_singularity_kernel,
    inject_into_existing_anc,
    LivingSingularityKernel,
    FractalQuantumNeuralManifold
)

__all__ = [
    "get_living_singularity_kernel",
    "inject_into_existing_anc",
    "LivingSingularityKernel",
    "FractalQuantumNeuralManifold",
]
