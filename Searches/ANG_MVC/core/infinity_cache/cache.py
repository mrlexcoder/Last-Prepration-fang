"""
InfinityCache — FAISS-backed vector memory with aging and eviction.

Storage layout (NVMe-friendly flat files):
  cache_dir/index.faiss   — FAISS flat L2 index
  cache_dir/meta.json     — list of {id, text, timestamp, access_count, summary}

Aging policy:
  - Entries older than TTL_SECONDS and with low access_count are evicted.
  - When size > MAX_ENTRIES, oldest half is summarised and replaced.
"""

import json
import time
import logging
import hashlib
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger("ang.infinity_cache")

# Graceful fallback if faiss or numpy not installed
try:
    import faiss
    import numpy as np
    _FAISS_OK = True
except ImportError:
    _FAISS_OK = False
    logger.warning("faiss/numpy not installed — InfinityCache running in no-vector mode")

EMBED_DIM = 384          # matches sentence-transformers/all-MiniLM-L6-v2
MAX_ENTRIES = 2000
TTL_SECONDS = 60 * 60 * 24 * 7   # 7 days


def _hash_id(text: str) -> str:
    return hashlib.sha1(text.encode()).hexdigest()[:16]


def _dummy_embed(text: str) -> "np.ndarray":
    """Deterministic dummy embedding when sentence-transformers not available."""
    import numpy as np
    rng = np.random.default_rng(abs(hash(text)) % (2**32))
    vec = rng.random(EMBED_DIM).astype("float32")
    vec /= np.linalg.norm(vec) + 1e-9
    return vec


def _get_embedder():
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        def embed(text: str):
            import numpy as np
            v = model.encode([text], normalize_embeddings=True)[0].astype("float32")
            return v
        return embed
    except Exception:
        logger.warning("sentence-transformers not available — using dummy embeddings")
        return _dummy_embed


class InfinityCache:
    def __init__(self, cache_dir: str = "/tmp/ang_infinity_cache"):
        self._dir = Path(cache_dir)
        self._dir.mkdir(parents=True, exist_ok=True)
        self._meta_path = self._dir / "meta.json"
        self._index_path = self._dir / "index.faiss"
        self._meta: List[dict] = []
        self._embed = _get_embedder()
        self._index = None
        self._load()

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def store(self, text: str, summary: Optional[str] = None) -> str:
        """Store text in cache. Returns entry id."""
        entry_id = _hash_id(text + str(time.time()))
        entry = {
            "id": entry_id,
            "text": text,
            "summary": summary or text[:120],
            "timestamp": time.time(),
            "access_count": 0,
        }
        self._meta.append(entry)
        if _FAISS_OK and self._index is not None:
            vec = self._embed(text).reshape(1, -1)
            self._index.add(vec)
        self._maybe_evict()
        self._save()
        logger.debug("stored entry %s", entry_id)
        return entry_id

    def search(self, query: str, top_k: int = 5) -> List[dict]:
        """Return top_k most similar entries."""
        if not self._meta:
            return []
        if not _FAISS_OK or self._index is None or self._index.ntotal == 0:
            # fallback: return most recent entries
            results = sorted(self._meta, key=lambda e: e["timestamp"], reverse=True)[:top_k]
        else:
            import numpy as np
            vec = self._embed(query).reshape(1, -1)
            k = min(top_k, self._index.ntotal)
            _, indices = self._index.search(vec, k)
            results = []
            for idx in indices[0]:
                if 0 <= idx < len(self._meta):
                    results.append(self._meta[idx])

        # bump access count
        ids = {r["id"] for r in results}
        for entry in self._meta:
            if entry["id"] in ids:
                entry["access_count"] += 1
        self._save()
        return results

    def stats(self) -> dict:
        return {
            "total_entries": len(self._meta),
            "faiss_available": _FAISS_OK,
            "index_size": self._index.ntotal if _FAISS_OK and self._index else 0,
            "cache_dir": str(self._dir),
        }

    # ------------------------------------------------------------------ #
    #  Internal                                                            #
    # ------------------------------------------------------------------ #

    def _load(self):
        if self._meta_path.exists():
            try:
                self._meta = json.loads(self._meta_path.read_text())
            except Exception:
                self._meta = []
        if _FAISS_OK:
            if self._index_path.exists():
                try:
                    self._index = faiss.read_index(str(self._index_path))
                except Exception:
                    self._index = faiss.IndexFlatL2(EMBED_DIM)
            else:
                self._index = faiss.IndexFlatL2(EMBED_DIM)

    def _save(self):
        self._meta_path.write_text(json.dumps(self._meta, indent=2))
        if _FAISS_OK and self._index is not None:
            faiss.write_index(self._index, str(self._index_path))

    def _maybe_evict(self):
        now = time.time()
        # TTL eviction
        self._meta = [
            e for e in self._meta
            if (now - e["timestamp"]) < TTL_SECONDS or e["access_count"] > 5
        ]
        # Size cap: drop oldest half
        if len(self._meta) > MAX_ENTRIES:
            self._meta.sort(key=lambda e: e["timestamp"])
            self._meta = self._meta[MAX_ENTRIES // 2:]
            # Rebuild FAISS index from remaining entries
            if _FAISS_OK:
                import numpy as np
                self._index = faiss.IndexFlatL2(EMBED_DIM)
                vecs = np.stack([self._embed(e["text"]) for e in self._meta])
                self._index.add(vecs)
        logger.debug("after eviction: %d entries", len(self._meta))
