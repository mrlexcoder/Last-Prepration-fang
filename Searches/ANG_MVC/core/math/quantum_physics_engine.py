import sys
from pathlib import Path
import importlib.util
def _load():
    base = Path(__file__).parent.parent.parent / "Machine_understanding" / "delta" / "math" / "quantum_physics_engine.py"
    spec = importlib.util.spec_from_file_location("_qpe", str(base))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.QuantumPhysicsEngine
QuantumPhysicsEngine = _load()
__all__ = ["QuantumPhysicsEngine"]
