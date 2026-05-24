#!/usr/bin/env python3
"""
ANC Perception PoC: Vision → Graph-Store → .anc Action → Telemetry (gRPC)

Tiny proof-of-concept closing the perception → world-model → planner → execution → learning cycle.

Flow:
1. Capture image (screenshot or file)
2. Extract embedding (CLIP-like via torch or stub)
3. Write node + embedding to PersistentWorldGraph (Neo4j-ready structure)
4. Trigger .anc action (e.g. notify-send via .anc execution)
5. Send telemetry via gRPC back to AI loop (LivingSingularityKernel)

This wires the first missing block (Perception & Grounding) into the existing ANC_Official stack.
"""

import time
import os
import subprocess
from pathlib import Path
import numpy as np

# ANC stack imports - robust path handling for development
import sys
from pathlib import Path
import importlib.util

current_file = Path(__file__).resolve()

# ANC_Official root (the true project root)
anc_official_root = current_file.parents[5]

# Also add to path for normal imports
sys.path.insert(0, str(anc_official_root))

def _load_module(name, abs_path):
    """Load a module from absolute path."""
    spec = importlib.util.spec_from_file_location(name, str(abs_path))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod

# Correct absolute paths
wm_path = anc_official_root / "Searches" / "ANG_MVC" / "core" / "world_model" / "persistent_world_graph.py"
anc_path = anc_official_root / "anc_lang" / "runtime" / "anc_runtime.py"
kernel_path = anc_official_root / "Searches" / "ANG_MVC" / "core" / "neural_brain" / "ANC_LivingSingularityKernel.py"
tel_path = anc_official_root / "Searches" / "ANG_MVC" / "core" / "perception" / "grpc" / "telemetry_bridge.py"

wm_mod = _load_module("persistent_world_graph", wm_path)
anc_mod = _load_module("anc_runtime", anc_path)
kernel_mod = _load_module("ANC_LivingSingularityKernel", kernel_path)
tel_mod = _load_module("telemetry_bridge", tel_path)

PersistentWorldGraph = wm_mod.PersistentWorldGraph
get_anc_runtime = anc_mod.get_anc_runtime
get_living_singularity_kernel = kernel_mod.get_living_singularity_kernel
get_telemetry = tel_mod.get_telemetry

# Optional gRPC (install: pip install grpcio grpcio-tools)
try:
    import grpc
    from concurrent import futures
    GRPC_AVAILABLE = True
except ImportError:
    GRPC_AVAILABLE = False

# --- Simple CLIP-like embedding (stub for PoC - replace with real CLIP in prod) ---
def get_image_embedding(image_path: str) -> list[float]:
    """Fake CLIP embedding. In real version: use openai/clip or transformers.CLIPModel."""
    # For PoC: use file hash + random as "visual embedding"
    import hashlib
    with open(image_path, "rb") as f:
        h = hashlib.sha256(f.read()).hexdigest()
    seed = int(h[:8], 16)
    rng = np.random.default_rng(seed)
    emb = rng.normal(0, 1, 512).astype(np.float32)
    emb = emb / np.linalg.norm(emb)
    return emb.tolist()

# --- Image capture ---
def capture_image(output_path: str = "/tmp/anc_poc_screenshot.png") -> str:
    """Capture screenshot on Linux. Falls back to dummy if no tool."""
    try:
        # Try mss (pip install mss) or scrot/fswebcam
        subprocess.run(
            ["scrot", output_path],  # common on Linux
            check=True,
            capture_output=True
        )
        print(f"[PoC] Captured screenshot: {output_path}")
        return output_path
    except Exception:
        # Fallback: create a tiny dummy PNG
        from PIL import Image
        img = Image.new("RGB", (640, 480), color=(30, 60, 120))
        img.save(output_path)
        print(f"[PoC] Using dummy image (no scrot): {output_path}")
        return output_path

# --- Neo4j-ready node writer (using our PersistentWorldGraph as stand-in) ---
def write_to_graph_store(image_path: str, embedding: list[float], description: str = "new visual object"):
    wm = PersistentWorldGraph()
    entity_id = wm.add_entity(
        entity_type="visual_observation",
        attributes={
            "image_path": image_path,
            "timestamp": time.time(),
            "description": description,
            "source": "poc_vision"
        },
        embedding_source=str(embedding[:8])  # use first dims for demo
    )
    # Add causal link example
    wm.add_causal_edge(
        from_id="kernel_pulse_latest",
        to_id=entity_id,
        relation="perceived_new_object",
        confidence=0.92
    )
    print(f"[PoC] Wrote visual node to WorldGraph: {entity_id}")
    return entity_id

# --- Trigger .anc action ---
def trigger_anc_action(message: str = "new object detected"):
    """Execute via .anc runtime (simulates .anc code doing OS action)."""
    runtime = get_anc_runtime()
    # Simple .anc "program" that calls notify-send
    anc_code = f'''
    fn main() {{
        exec("notify-send 'ANC Perception' '{message}'");
        return 0;
    }}
    '''
    result = runtime.execute_simple_anc(anc_code)
    print(f"[PoC] .anc action executed: {result}")
    return result

# --- gRPC Telemetry (simple server/client for AI loop) ---
if GRPC_AVAILABLE:
    import grpc
    from concurrent import futures

    class TelemetryServicer:
        def SendPerceptionEvent(self, request, context):
            print(f"[gRPC] Received perception telemetry: {request}")
            # In real: forward to LivingSingularityKernel.pulse_consciousness()
            kernel = get_living_singularity_kernel()
            # Fake pulse with perception data
            kernel.pulse_consciousness({
                "perception": request.description,
                "embedding_dim": len(request.embedding),
                "timestamp": request.timestamp
            })
            return "ok"

    def serve_grpc():
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
        # In real: add generated servicer
        print("[gRPC] Telemetry server stub running (port 50051)")
        # server.add_generic_rpc_handlers(...)
        server.start()
        return server

def send_telemetry_via_grpc(entity_id: str, embedding: list[float], description: str):
    """Send telemetry using the ANC perception gRPC bridge (or direct kernel injection)."""
    telemetry = get_telemetry()
    event = {
        "entity_id": entity_id,
        "embedding_preview": embedding[:4],
        "description": description,
        "timestamp": time.time()
    }
    telemetry.send_perception_event(event)

# --- Main PoC ---
def run_perception_poc():
    print("=== ANC Perception PoC: Vision → Graph → .anc → AI Loop (gRPC) ===")
    img_path = capture_image()
    embedding = get_image_embedding(img_path)
    entity_id = write_to_graph_store(img_path, embedding, "new visual object detected on desktop")
    trigger_anc_action("new object")
    send_telemetry_via_grpc(entity_id, embedding, "new visual object detected on desktop")
    print("=== PoC cycle complete. Perception wired into world model + kernel. ===")
    return entity_id

if __name__ == "__main__":
    run_perception_poc()
