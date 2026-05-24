"""
bootstrap_kernel.py

One-line activation for the Living Singularity Kernel inside the running ANC.

Usage (from anywhere in the project):

    from core.neural_brain.bootstrap_kernel import activate_singularity_kernel
    kernel = activate_singularity_kernel()

This will:
- Wire the real LaptopObserver
- Wire ProAGIMaster if available
- Start the kernel collecting live data and writing real code
"""

import sys
from pathlib import Path

# Make sure we can import from the ANC_MVC root
PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.neural_brain import get_living_singularity_kernel, inject_into_existing_anc

try:
    from core.laptop_observer import get_laptop_observer
except ImportError:
    get_laptop_observer = None


def activate_singularity_kernel(start_loop: bool = False):
    """
    Activates the Living Singularity Kernel with all available real components.
    Call this once during ANG startup.
    """
    kernel = get_living_singularity_kernel()

    # Wire real environment awareness
    laptop_observer = None
    if get_laptop_observer:
        try:
            laptop_observer = get_laptop_observer()
        except Exception:
            pass

    # Try to get Pro AGI Master if it exists in state
    pro_agi = None
    try:
        from core.state import state
        pro_agi = getattr(state, "pro_agi_master", None)
    except Exception:
        pass

    # Inject everything we can find
    inject_into_existing_anc(
        pro_agi_master=pro_agi,
        laptop_observer=laptop_observer
    )

    print("[Singularity Bootstrap] Living Kernel activated with real system access.")

    if start_loop:
        # Non-blocking start
        import threading
        t = threading.Thread(target=kernel.start_consciousness_loop, args=(3.5,), daemon=True)
        t.start()
        print("[Singularity] Consciousness loop running in background thread.")

    return kernel


if __name__ == "__main__":
    k = activate_singularity_kernel(start_loop=True)
    print("Kernel is now running live. Press Ctrl+C to stop.")
    try:
        while True:
            import time
            time.sleep(10)
    except KeyboardInterrupt:
        k.stop()
