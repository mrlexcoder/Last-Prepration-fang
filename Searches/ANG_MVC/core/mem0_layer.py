"""
Mem0 Memory Layer — Phase 2
Persistent, personalized memory per user/session.
Falls back to Go store if Mem0 not available.

Mem0 gives us:
  - Semantic deduplication
  - Auto-summarization of long histories
  - User-level memory (preferences, facts, style)
  - Session-level memory (current conversation context)
"""

import asyncio
import logging
import os
from typing import Optional

logger = logging.getLogger("ang.mem0")

MEM0_API_KEY = os.getenv("MEM0_API_KEY", "")  # set for cloud, empty = local OSS


def _get_mem0():
    """Lazy-load Mem0. Returns None if not installed."""
    try:
        from mem0 import Memory
        if MEM0_API_KEY:
            # Cloud Mem0
            from mem0 import MemoryClient
            return MemoryClient(api_key=MEM0_API_KEY)
        else:
            # Local OSS Mem0 with default config
            config = {
                "vector_store": {
                    "provider": "qdrant",
                    "config": {
                        "collection_name": "ang_memory",
                        "host": os.getenv("QDRANT_HOST", "localhost"),
                        "port": int(os.getenv("QDRANT_PORT", "6333")),
                        "embedding_model_dims": 384,
                    }
                },
                "llm": {
                    "provider": "ollama",
                    "config": {
                        "model": "qwen2.5:4b",
                        "ollama_base_url": os.getenv("OLLAMA_URL", "http://localhost:11434"),
                    }
                },
                "embedder": {
                    "provider": "huggingface",
                    "config": {"model": "sentence-transformers/all-MiniLM-L6-v2"}
                }
            }
            return Memory.from_config(config)
    except ImportError:
        logger.warning("mem0ai not installed — using Go store fallback")
        return None
    except Exception as exc:
        logger.warning("Mem0 init failed (%s) — using Go store fallback", exc)
        return None


class Mem0Layer:
    """
    Unified memory interface.
    Tries Mem0 first, falls back to Go store KV.
    """

    def __init__(self):
        self._mem0 = _get_mem0()
        self._available = self._mem0 is not None
        if self._available:
            logger.info("Mem0 memory layer active")
        else:
            logger.info("Mem0 unavailable — using Go store for memory")

    def add(self, messages: list[dict], user_id: str, session_id: Optional[str] = None,
            metadata: Optional[dict] = None) -> dict:
        """
        Add messages to memory.
        messages: [{"role": "user"|"assistant", "content": "..."}]
        """
        if self._available:
            try:
                result = self._mem0.add(
                    messages,
                    user_id=user_id,
                    run_id=session_id,
                    metadata=metadata or {},
                )
                return {"ok": True, "source": "mem0", "result": result}
            except Exception as exc:
                logger.warning("mem0.add failed: %s", exc)

        # Fallback: Go store
        from core.storage_client import get_storage
        store = get_storage()
        for msg in messages:
            store.kv.store_memory(
                session_id=session_id or user_id,
                role=msg.get("role", "user"),
                content=msg.get("content", ""),
            )
        return {"ok": True, "source": "go_store"}

    def search(self, query: str, user_id: str, limit: int = 10) -> list[dict]:
        """Semantic search over user's memory."""
        if self._available:
            try:
                results = self._mem0.search(query, user_id=user_id, limit=limit)
                # Normalize to list of dicts
                if isinstance(results, dict):
                    results = results.get("results", [])
                return [
                    {"memory": r.get("memory", r.get("text", "")),
                     "score": r.get("score", 1.0),
                     "metadata": r.get("metadata", {})}
                    for r in results
                ]
            except Exception as exc:
                logger.warning("mem0.search failed: %s", exc)

        # Fallback: Go store recent memory
        from core.storage_client import get_storage
        entries = get_storage().get_session_context(user_id, limit=limit)
        return [{"memory": e["content"], "score": 1.0, "metadata": {}} for e in entries]

    def get_all(self, user_id: str) -> list[dict]:
        """Get all memories for a user."""
        if self._available:
            try:
                results = self._mem0.get_all(user_id=user_id)
                if isinstance(results, dict):
                    results = results.get("results", [])
                return results
            except Exception as exc:
                logger.warning("mem0.get_all failed: %s", exc)

        from core.storage_client import get_storage
        return get_storage().get_session_context(user_id, limit=200)

    def delete_all(self, user_id: str) -> bool:
        if self._available:
            try:
                self._mem0.delete_all(user_id=user_id)
                return True
            except Exception:
                pass
        return False

    def build_context_prompt(self, query: str, user_id: str) -> str:
        """Build a memory-enriched context string to prepend to prompts."""
        memories = self.search(query, user_id=user_id, limit=5)
        if not memories:
            return ""
        lines = ["[Relevant memories from past interactions:]"]
        for m in memories:
            lines.append(f"- {m['memory']}")
        return "\n".join(lines) + "\n\n"

    async def store(self, data: dict) -> bool:
        """Compatibility shim — works whether called with await or not."""
        try:
            payload = [{"role": "system", "content": str(data)}]
            uid = (data or {}).get("user_id", "system")
            if self._available:
                try:
                    # Try native if it exists on the underlying mem0
                    if hasattr(self._mem0, "store"):
                        if asyncio.iscoroutinefunction(self._mem0.store):
                            await self._mem0.store(data)
                        else:
                            self._mem0.store(data)
                        return True
                except Exception:
                    pass
            # Fallback to our add
            self.add(payload, user_id=uid, metadata=(data or {}).get("metadata"))
            return True
        except Exception as e:
            logger.debug("Mem0Layer.store shim: %s", e)
            return False

    def store_sync(self, data: dict) -> bool:
        """Sync version for code that calls without await."""
        try:
            self.add([{"role": "system", "content": str(data)}], user_id=(data or {}).get("user_id", "system"))
            return True
        except Exception:
            return False

    @property
    def available(self) -> bool:
        return self._available


# Singleton
_mem0_layer: Optional[Mem0Layer] = None

def get_mem0() -> Mem0Layer:
    global _mem0_layer
    if _mem0_layer is None:
        _mem0_layer = Mem0Layer()
    return _mem0_layer
