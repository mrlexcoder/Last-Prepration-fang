"""
ANG Background Workers
Kafka consumers that process the pipeline continuously.

Workers:
  - EmbedWorker:    consumes ang.clean_chunks → embeds → Qdrant
  - TrainWorker:    consumes ang.train_signals → Go store training queue
  - HealthWorker:   periodic stats logging
"""

import asyncio
import logging
import time

logger = logging.getLogger("ang.workers")


async def embed_worker():
    """Consume clean chunks from Kafka, embed, store in Qdrant."""
    from web_intel.kafka_bus import ANGConsumer, T_CLEAN_CHUNKS
    from web_intel.embedder import get_embedder

    consumer = ANGConsumer(topics=[T_CLEAN_CHUNKS], group_id="ang-embed-worker")
    await consumer.start()
    embedder = get_embedder()

    batch: list[dict] = []
    last_flush = time.time()
    BATCH_SIZE = 32
    FLUSH_INTERVAL = 2.0  # flush every 2s even if batch not full

    logger.info("embed_worker started")
    try:
        async for msg in consumer.messages():
            if msg["topic"] == T_CLEAN_CHUNKS:
                batch.append(msg["value"])

            now = time.time()
            if len(batch) >= BATCH_SIZE or (batch and now - last_flush > FLUSH_INTERVAL):
                t0 = time.perf_counter()
                n = embedder.upsert_chunks(batch)
                ms = (time.perf_counter() - t0) * 1000
                logger.debug("embed_worker: indexed %d chunks in %.0fms", n, ms)
                batch.clear()
                last_flush = now
    finally:
        await consumer.stop()


async def train_signal_worker():
    """Consume training signals from Kafka, persist to Go store."""
    from web_intel.kafka_bus import ANGConsumer, T_TRAIN_SIGNAL

    consumer = ANGConsumer(topics=[T_TRAIN_SIGNAL], group_id="ang-train-worker")
    await consumer.start()

    logger.info("train_signal_worker started")
    try:
        async for msg in consumer.messages():
            if msg["topic"] != T_TRAIN_SIGNAL:
                continue
            v = msg["value"]
            try:
                from core.storage_client import get_storage
                storage = get_storage()
                storage.kv.store_training_sample(
                    prompt=v.get("prompt", ""),
                    completion=v.get("completion", ""),
                    quality=float(v.get("quality", 0.5)),
                    source=v.get("source", "web"),
                )
            except Exception as exc:
                logger.debug("train_signal_worker store failed: %s", exc)
    finally:
        await consumer.stop()


async def health_worker():
    """Periodic stats logging."""
    while True:
        await asyncio.sleep(60)
        try:
            from web_intel.embedder import get_embedder
            from core.storage_client import get_storage
            emb = get_embedder()
            stats = get_storage().storage_stats()
            ring = stats.get("ring", {})
            inf_count = ring.get("inference", {}).get("count", "?")
            logger.info("health: inference_ring=%s storage=%s", inf_count, stats.get("kv", {}))
        except Exception:
            pass


def start_workers():
    """Start all background workers in daemon threads."""
    import threading

    def _run_worker(coro_fn, name):
        def _thread():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(coro_fn())
        t = threading.Thread(target=_thread, daemon=True, name=name)
        t.start()
        return t

    workers = [
        _run_worker(embed_worker, "ang-embed-worker"),
        _run_worker(train_signal_worker, "ang-train-signal-worker"),
        _run_worker(health_worker, "ang-health-worker"),
    ]
    logger.info("Started %d background workers", len(workers))
    return workers
