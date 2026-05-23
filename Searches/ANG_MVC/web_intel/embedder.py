"""
ANG Embedder + Qdrant Indexer
Consumes ang.clean_chunks from Kafka, embeds, stores in Qdrant.
Also provides fast semantic search for query-time retrieval.
"""

import asyncio
import hashlib
import logging
import os
import time
from typing import Optional

logger = logging.getLogger("ang.embedder")

QDRANT_HOST       = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT       = int(os.getenv("QDRANT_PORT", "6333"))
QDRANT_COLLECTION = os.getenv("QDRANT_WEB_COLLECTION", "ang_web_intel")
EMBED_MODEL       = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMBED_DIM         = 384
EMBED_BATCH       = int(os.getenv("EMBED_BATCH", "64"))


def _get_embedder():
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(EMBED_MODEL)
        logger.info("Embedder loaded: %s", EMBED_MODEL)
        return model
    except Exception as exc:
        logger.warning("sentence-transformers unavailable: %s", exc)
        return None


def _get_qdrant():
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Distance, VectorParams, PointStruct
        client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=5)
        # Ensure collection exists
        existing = [c.name for c in client.get_collections().collections]
        if QDRANT_COLLECTION not in existing:
            client.create_collection(
                collection_name=QDRANT_COLLECTION,
                vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE),
            )
            logger.info("Created Qdrant collection: %s", QDRANT_COLLECTION)
        return client
    except Exception as exc:
        logger.warning("Qdrant unavailable: %s", exc)
        return None


class ANGEmbedder:
    def __init__(self):
        self._model = None
        self._qdrant = None
        self._buffer: list[dict] = []
        self._flush_size = EMBED_BATCH

    def _ensure_loaded(self):
        if self._model is None:
            self._model = _get_embedder()
        if self._qdrant is None:
            self._qdrant = _get_qdrant()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        self._ensure_loaded()
        if not self._model:
            # Dummy embeddings
            import random
            return [[random.random() for _ in range(EMBED_DIM)] for _ in texts]
        vecs = self._model.encode(texts, batch_size=EMBED_BATCH, normalize_embeddings=True)
        return vecs.tolist()

    def upsert_chunks(self, chunks: list[dict]) -> int:
        """
        chunks: [{"url": str, "chunk": str, "query": str, "chunk_idx": int}]
        Returns number of points upserted.
        """
        self._ensure_loaded()
        if not self._qdrant or not chunks:
            return 0

        from qdrant_client.models import PointStruct

        texts = [c["chunk"] for c in chunks]
        vectors = self.embed_texts(texts)

        points = []
        for i, (chunk, vec) in enumerate(zip(chunks, vectors)):
            uid = int(hashlib.md5(
                f"{chunk['url']}:{chunk.get('chunk_idx', i)}".encode()
            ).hexdigest()[:15], 16)
            points.append(PointStruct(
                id=uid,
                vector=vec,
                payload={
                    "url": chunk["url"],
                    "chunk": chunk["chunk"][:1000],
                    "query": chunk.get("query", ""),
                    "ts": time.time(),
                },
            ))

        try:
            self._qdrant.upsert(collection_name=QDRANT_COLLECTION, points=points)
            return len(points)
        except Exception as exc:
            logger.warning("Qdrant upsert failed: %s", exc)
            return 0

    def search(self, query: str, top_k: int = 10, score_threshold: float = 0.35) -> list[dict]:
        """Semantic search over indexed web chunks."""
        self._ensure_loaded()
        if not self._qdrant:
            return []

        vecs = self.embed_texts([query])
        try:
            results = self._qdrant.search(
                collection_name=QDRANT_COLLECTION,
                query_vector=vecs[0],
                limit=top_k,
                score_threshold=score_threshold,
                with_payload=True,
            )
            return [
                {
                    "url": r.payload.get("url", ""),
                    "chunk": r.payload.get("chunk", ""),
                    "score": r.score,
                    "query": r.payload.get("query", ""),
                }
                for r in results
            ]
        except Exception as exc:
            logger.warning("Qdrant search failed: %s", exc)
            return []

    async def run_indexer(self, consumer):
        """
        Background task: consume ang.clean_chunks from Kafka, batch-embed, upsert.
        """
        logger.info("Embedder indexer started")
        batch: list[dict] = []

        async for msg in consumer.messages():
            if msg["topic"] != "ang.clean_chunks":
                continue
            batch.append(msg["value"])

            if len(batch) >= self._flush_size:
                t0 = time.perf_counter()
                n = self.upsert_chunks(batch)
                ms = (time.perf_counter() - t0) * 1000
                logger.info("Indexed %d chunks in %.0fms", n, ms)
                batch.clear()


# Singleton
_embedder: Optional[ANGEmbedder] = None

def get_embedder() -> ANGEmbedder:
    global _embedder
    if _embedder is None:
        _embedder = ANGEmbedder()
    return _embedder
