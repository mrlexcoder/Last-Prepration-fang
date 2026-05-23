"""
ANG Storage Client
Bridges Python ↔ Go gRPC store + Rust ring buffer HTTP
Falls back gracefully if either service is down.
"""

import json
import logging
import os
import time
from typing import Any, Optional

import httpx

logger = logging.getLogger("ang.storage_client")

RINGBUF_URL = os.getenv("RINGBUF_URL", "http://localhost:8090")
GO_STORE_GRPC = os.getenv("GO_STORE_GRPC", "localhost:50051")

# ─── gRPC stub (lazy import so app starts without grpc installed) ─────────────

_grpc_stub = None

def _get_grpc_stub():
    global _grpc_stub
    if _grpc_stub is not None:
        return _grpc_stub
    try:
        import grpc
        # Generated stubs expected at storage/go_store/proto/ang_store_pb2_grpc.py
        import sys, pathlib
        proto_path = str(pathlib.Path(__file__).resolve().parent.parent / "storage" / "go_store")
        if proto_path not in sys.path:
            sys.path.insert(0, proto_path)
        import proto.ang_store_pb2_grpc as pb2_grpc
        channel = grpc.insecure_channel(GO_STORE_GRPC)
        _grpc_stub = pb2_grpc.ANGStoreStub(channel)
        logger.info("gRPC stub connected to %s", GO_STORE_GRPC)
    except Exception as exc:
        logger.warning("gRPC unavailable (%s) — KV ops will use fallback", exc)
        _grpc_stub = None
    return _grpc_stub


# ─── Ring Buffer Client ───────────────────────────────────────────────────────

class RingBufClient:
    """Sync HTTP client for Rust ring buffer. Ultra-low latency hot path."""

    def __init__(self):
        self._client = httpx.Client(base_url=RINGBUF_URL, timeout=0.5)
        self._available = True

    def push(self, ring: str, data: dict) -> bool:
        if not self._available:
            return False
        try:
            r = self._client.post("/push", json={"ring": ring, "data": json.dumps(data)})
            return r.json().get("ok", False)
        except Exception as exc:
            logger.debug("ringbuf push failed: %s", exc)
            self._available = False
            return False

    def pop(self, ring: str) -> Optional[dict]:
        if not self._available:
            return None
        try:
            r = self._client.post("/pop", json={"ring": ring})
            resp = r.json()
            if resp.get("ok") and resp.get("data"):
                return json.loads(resp["data"])
        except Exception as exc:
            logger.debug("ringbuf pop failed: %s", exc)
        return None

    def peek(self, ring: str) -> list[dict]:
        if not self._available:
            return []
        try:
            r = self._client.post("/peek", json={"ring": ring})
            items = r.json().get("items", [])
            return [json.loads(i) for i in items if i]
        except Exception:
            return []

    def stats(self) -> dict:
        try:
            r = self._client.get("/stats")
            self._available = True
            return r.json()
        except Exception:
            return {}

    def ping(self) -> bool:
        try:
            r = self._client.get("/health", timeout=0.3)
            self._available = r.status_code == 200
            return self._available
        except Exception:
            self._available = False
            return False


# ─── Go KV Client ─────────────────────────────────────────────────────────────

class GoStoreClient:
    """gRPC client for Go BadgerDB store."""

    def set(self, key: str, value: Any, ttl_seconds: int = 0) -> bool:
        stub = _get_grpc_stub()
        if not stub:
            return False
        try:
            import proto.ang_store_pb2 as pb2
            data = json.dumps(value).encode()
            resp = stub.Set(pb2.SetRequest(key=key, value=data, ttl_seconds=ttl_seconds))
            return resp.ok
        except Exception as exc:
            logger.debug("go_store set failed: %s", exc)
            return False

    def get(self, key: str) -> Optional[Any]:
        stub = _get_grpc_stub()
        if not stub:
            return None
        try:
            import proto.ang_store_pb2 as pb2
            resp = stub.Get(pb2.GetRequest(key=key))
            if resp.found:
                return json.loads(resp.value)
        except Exception as exc:
            logger.debug("go_store get failed: %s", exc)
        return None

    def store_memory(self, session_id: str, role: str, content: str, metadata: dict = None) -> str:
        stub = _get_grpc_stub()
        if not stub:
            return ""
        try:
            import proto.ang_store_pb2 as pb2
            resp = stub.StoreMemory(pb2.StoreMemoryRequest(
                session_id=session_id,
                role=role,
                content=content,
                metadata=metadata or {},
            ))
            return resp.entry_id if resp.ok else ""
        except Exception as exc:
            logger.debug("go_store store_memory failed: %s", exc)
            return ""

    def get_memory(self, session_id: str, limit: int = 50) -> list[dict]:
        stub = _get_grpc_stub()
        if not stub:
            return []
        try:
            import proto.ang_store_pb2 as pb2
            resp = stub.GetMemory(pb2.GetMemoryRequest(session_id=session_id, limit=limit))
            return [
                {"id": e.id, "role": e.role, "content": e.content, "timestamp": e.timestamp}
                for e in resp.entries
            ]
        except Exception as exc:
            logger.debug("go_store get_memory failed: %s", exc)
            return []

    def store_training_sample(self, prompt: str, completion: str, quality: float, source: str = "auto") -> str:
        stub = _get_grpc_stub()
        if not stub:
            return ""
        try:
            import proto.ang_store_pb2 as pb2
            resp = stub.StoreTrainingSample(pb2.StoreTrainingSampleRequest(
                prompt=prompt,
                completion=completion,
                quality=quality,
                source=source,
            ))
            return resp.sample_id if resp.ok else ""
        except Exception as exc:
            logger.debug("go_store store_training_sample failed: %s", exc)
            return ""

    def get_training_samples(self, limit: int = 1000, min_quality: float = 0.7) -> list[dict]:
        stub = _get_grpc_stub()
        if not stub:
            return []
        try:
            import proto.ang_store_pb2 as pb2
            resp = stub.GetTrainingSamples(pb2.GetTrainingSamplesRequest(
                limit=limit, min_quality=min_quality
            ))
            return [
                {"id": s.id, "prompt": s.prompt, "completion": s.completion,
                 "quality": s.quality, "source": s.source}
                for s in resp.samples
            ]
        except Exception as exc:
            logger.debug("go_store get_training_samples failed: %s", exc)
            return []

    def stats(self) -> dict:
        stub = _get_grpc_stub()
        if not stub:
            return {"error": "grpc_unavailable"}
        try:
            import proto.ang_store_pb2 as pb2
            resp = stub.Stats(pb2.StatsRequest())
            return {"lsm_bytes": resp.lsm_size_bytes, "vlog_bytes": resp.vlog_size_bytes}
        except Exception as exc:
            return {"error": str(exc)}


# ─── Unified Storage Facade ───────────────────────────────────────────────────

class ANGStorage:
    """
    Single entry point for all storage operations.
    Writes to both fast ring buffer (hot) and Go persistent store (cold).
    """

    def __init__(self):
        self.ring = RingBufClient()
        self.kv = GoStoreClient()
        self._local_fallback: list[dict] = []  # in-memory if both services down

    def record_inference(self, session_id: str, prompt: str, output: str,
                         confidence: float, runtime: str, latency_ms: float):
        """Hot path: push to ring buffer immediately, persist to Go store async."""
        payload = {
            "session_id": session_id,
            "prompt": prompt,
            "output": output,
            "confidence": confidence,
            "runtime": runtime,
            "latency_ms": latency_ms,
            "ts": time.time(),
        }
        # Ring buffer — sub-ms
        self.ring.push("inference", payload)

        # Persistent memory
        self.kv.store_memory(session_id, "user", prompt)
        self.kv.store_memory(session_id, "assistant", output,
                             metadata={"confidence": str(confidence), "runtime": runtime})

        # Auto-queue high-quality outputs as training data
        if confidence >= 0.80:
            self.ring.push("training", {"prompt": prompt, "completion": output, "quality": confidence})
            self.kv.store_training_sample(prompt, output, confidence, source="auto_inference")

        # Local fallback
        self._local_fallback.append(payload)
        if len(self._local_fallback) > 500:
            self._local_fallback = self._local_fallback[-500:]

    def record_thought(self, agent_id: str, thought: str, confidence: float):
        """Multi-agent thought trace — goes to thought ring."""
        self.ring.push("thought", {
            "agent_id": agent_id,
            "thought": thought,
            "confidence": confidence,
            "ts": time.time(),
        })

    def get_session_context(self, session_id: str, limit: int = 20) -> list[dict]:
        """Retrieve conversation history for a session."""
        return self.kv.get_memory(session_id, limit=limit)

    def get_recent_inferences(self, n: int = 100) -> list[dict]:
        """Peek at recent inference ring — for agent context."""
        return self.ring.peek("inference")[-n:]

    def get_training_queue(self, min_quality: float = 0.75) -> list[dict]:
        """Pull training samples ready for Unsloth."""
        # First drain training ring
        ring_items = self.ring.peek("training")
        # Then get persisted ones
        persisted = self.kv.get_training_samples(limit=2000, min_quality=min_quality)
        return ring_items + persisted

    def storage_stats(self) -> dict:
        return {
            "ring": self.ring.stats(),
            "kv": self.kv.stats(),
            "local_fallback_count": len(self._local_fallback),
        }


# Singleton
_storage: Optional[ANGStorage] = None

def get_storage() -> ANGStorage:
    global _storage
    if _storage is None:
        _storage = ANGStorage()
    return _storage
