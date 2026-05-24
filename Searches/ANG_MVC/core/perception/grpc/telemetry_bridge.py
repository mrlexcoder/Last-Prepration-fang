"""
Minimal gRPC Telemetry Service for ANC Perception PoC

This demonstrates sending perception events (image embeddings, graph nodes)
back into the Living Singularity Kernel / IntegrationManager loop.

In production: use real proto + generated code + secure channel.
"""

import time
from typing import Dict, Any

# Fallback if grpcio not installed
class PerceptionTelemetry:
    def __init__(self):
        self.events = []

    def send_perception_event(self, event: Dict[str, Any]):
        """Simulates gRPC SendPerceptionEvent call."""
        event["received_at"] = time.time()
        self.events.append(event)
        print(f"[Telemetry] Perception event received: {event.get('description', 'no desc')}")

        # Feed directly into kernel (this is the integration point)
        try:
            from Searches.ANG_MVC.core.neural_brain.ANC_LivingSingularityKernel import get_living_singularity_kernel
            kernel = get_living_singularity_kernel()
            kernel.pulse_consciousness({
                "type": "perception_event",
                "data": event
            })
            print("[Telemetry] Event injected into LivingSingularityKernel")
        except Exception as e:
            print(f"[Telemetry] Kernel injection failed: {e}")

    def get_recent_events(self, n: int = 5):
        return self.events[-n:]


# Singleton
_telemetry = None

def get_telemetry():
    global _telemetry
    if _telemetry is None:
        _telemetry = PerceptionTelemetry()
    return _telemetry
