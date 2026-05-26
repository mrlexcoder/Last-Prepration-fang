"""
anc_runtime.py
ANC Language Runtime (Phase 0)

This is the initial execution engine for .anc files.
It provides:
- Parsing of basic .anc syntax
- Direct calls into the C bridge (libanc.so)
- Integration points for the LivingSingularityKernel and Futur-Stick stack

The AGI (LivingSingularityKernel) can generate .anc code, compile it via this runtime,
and execute it at OS level with C/C++ speed.
"""

import os
import ctypes
import subprocess
from pathlib import Path

# Load the C bridge
BRIDGE_PATH = Path(__file__).parent.parent / "c_bridge" / "libanc.so"

class ANCRuntime:
    def __init__(self):
        if BRIDGE_PATH.exists():
            self.lib = ctypes.CDLL(str(BRIDGE_PATH))
            self._setup_functions()
        else:
            self.lib = None
            print("[ANC Runtime] Warning: libanc.so not found. Build it first with: gcc -shared -fPIC anc_c_bridge.c -o libanc.so")

    def _setup_functions(self):
        # System
        self.lib.anc_get_pid.restype = ctypes.c_long
        self.lib.anc_get_tid.restype = ctypes.c_long
        self.lib.anc_read_proc_status.argtypes = [ctypes.c_char_p, ctypes.c_size_t]
        self.lib.anc_read_proc_status.restype = ctypes.c_int

        # Memory
        self.lib.anc_mmap_anon.argtypes = [ctypes.c_size_t]
        self.lib.anc_mmap_anon.restype = ctypes.c_void_p

        # Vectors (neural)
        self.lib.anc_vector_add_f32.argtypes = [
            ctypes.POINTER(ctypes.c_float),
            ctypes.POINTER(ctypes.c_float),
            ctypes.POINTER(ctypes.c_float),
            ctypes.c_size_t
        ]

    def get_pid(self):
        if self.lib:
            return self.lib.anc_get_pid()
        return os.getpid()

    def read_proc_status(self):
        if not self.lib:
            return "C bridge not loaded"
        buf = ctypes.create_string_buffer(4096)
        n = self.lib.anc_read_proc_status(buf, 4096)
        return buf.value.decode() if n > 0 else "Failed"

    def execute_simple_anc(self, code: str):
        """
        Very basic interpreter for early .anc code.
        In later versions this will become a real compiler + JIT.
        """
        lines = code.strip().split('\n')
        output = []
        for line in lines:
            line = line.strip()
            if line.startswith("print"):
                output.append(line)
            elif "getpid" in line:
                pid = self.get_pid()
                output.append(f"Current PID: {pid}")
            elif "proc_status" in line:
                status = self.read_proc_status()
                output.append("Proc status (truncated): " + status[:300])
        return "\n".join(output)


# Singleton for the AGI kernel to use
_runtime_instance = None

def get_anc_runtime():
    global _runtime_instance
    if _runtime_instance is None:
        _runtime_instance = ANCRuntime()
    return _runtime_instance
