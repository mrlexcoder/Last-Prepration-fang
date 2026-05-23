"""
Kafka Message Bus — decouples scraping from processing.

Topics:
  ang.raw_urls      — {url, query, priority, ts}
  ang.raw_html      — {url, html, query, ts}
  ang.clean_chunks  — {url, chunk, embedding_ready, ts}
  ang.train_signals — {prompt, completion, quality, source}

Falls back to in-process asyncio queues if Kafka not available.
"""

import asyncio
import json
import logging
import os
import time
from typing import Optional, AsyncIterator

logger = logging.getLogger("ang.kafka")

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
KAFKA_ENABLED = os.getenv("KAFKA_ENABLED", "1") == "1"

# Topic names
T_RAW_URLS     = "ang.raw_urls"
T_RAW_HTML     = "ang.raw_html"
T_CLEAN_CHUNKS = "ang.clean_chunks"
T_TRAIN_SIGNAL = "ang.train_signals"

ALL_TOPICS = [T_RAW_URLS, T_RAW_HTML, T_CLEAN_CHUNKS, T_TRAIN_SIGNAL]


# ─── Fallback in-process queues ───────────────────────────────────────────────

_local_queues: dict[str, asyncio.Queue] = {}

def _get_local_queue(topic: str) -> asyncio.Queue:
    if topic not in _local_queues:
        _local_queues[topic] = asyncio.Queue(maxsize=50_000)
    return _local_queues[topic]


# ─── Producer ─────────────────────────────────────────────────────────────────

class ANGProducer:
    def __init__(self):
        self._producer = None
        self._use_kafka = False
        if KAFKA_ENABLED:
            self._init_kafka()

    def _init_kafka(self):
        try:
            from aiokafka import AIOKafkaProducer
            self._ProducerClass = AIOKafkaProducer
            self._use_kafka = True
            logger.info("Kafka producer configured: %s", KAFKA_BROKERS)
        except ImportError:
            logger.warning("aiokafka not installed — using in-process queues")

    async def start(self):
        if self._use_kafka:
            from aiokafka import AIOKafkaProducer
            self._producer = AIOKafkaProducer(
                bootstrap_servers=KAFKA_BROKERS,
                value_serializer=lambda v: json.dumps(v).encode(),
                compression_type=None,
                linger_ms=5,          # batch for 5ms — throughput vs latency tradeoff
                max_batch_size=65536,
            )
            await self._producer.start()

    async def stop(self):
        if self._producer:
            await self._producer.stop()

    async def send(self, topic: str, value: dict, key: Optional[str] = None):
        value["_ts"] = time.time()
        if self._use_kafka and self._producer:
            try:
                k = key.encode() if key else None
                await self._producer.send(topic, value=value, key=k)
                return
            except Exception as exc:
                logger.debug("kafka send failed, using local queue: %s", exc)
        # Fallback
        q = _get_local_queue(topic)
        try:
            q.put_nowait(value)
        except asyncio.QueueFull:
            logger.warning("local queue full for topic %s — dropping", topic)

    async def send_raw_url(self, url: str, query: str, priority: int = 5):
        await self.send(T_RAW_URLS, {"url": url, "query": query, "priority": priority})

    async def send_raw_html(self, url: str, html: str, query: str):
        await self.send(T_RAW_HTML, {"url": url, "html": html, "query": query})

    async def send_clean_chunk(self, url: str, chunk: str, query: str, chunk_idx: int = 0):
        await self.send(T_CLEAN_CHUNKS, {
            "url": url, "chunk": chunk, "query": query,
            "chunk_idx": chunk_idx, "embedding_ready": False,
        })

    async def send_train_signal(self, prompt: str, completion: str, quality: float, source: str = "web"):
        await self.send(T_TRAIN_SIGNAL, {
            "prompt": prompt, "completion": completion,
            "quality": quality, "source": source,
        })


# ─── Consumer ─────────────────────────────────────────────────────────────────

class ANGConsumer:
    def __init__(self, topics: list[str], group_id: str = "ang-workers"):
        self._topics = topics
        self._group_id = group_id
        self._consumer = None
        self._use_kafka = False
        if KAFKA_ENABLED:
            try:
                from aiokafka import AIOKafkaConsumer
                self._use_kafka = True
            except ImportError:
                pass

    async def start(self):
        if self._use_kafka:
            from aiokafka import AIOKafkaConsumer
            self._consumer = AIOKafkaConsumer(
                *self._topics,
                bootstrap_servers=KAFKA_BROKERS,
                group_id=self._group_id,
                value_deserializer=lambda v: json.loads(v.decode()),
                auto_offset_reset="latest",
                enable_auto_commit=True,
                max_poll_records=500,
            )
            await self._consumer.start()

    async def stop(self):
        if self._consumer:
            await self._consumer.stop()

    async def messages(self) -> AsyncIterator[dict]:
        """Async generator yielding messages from subscribed topics."""
        if self._use_kafka and self._consumer:
            async for msg in self._consumer:
                yield {"topic": msg.topic, "value": msg.value, "offset": msg.offset}
        else:
            # Round-robin local queues
            while True:
                for topic in self._topics:
                    q = _get_local_queue(topic)
                    try:
                        value = q.get_nowait()
                        yield {"topic": topic, "value": value, "offset": -1}
                    except asyncio.QueueEmpty:
                        pass
                await asyncio.sleep(0.001)  # 1ms poll


# ─── Singletons ───────────────────────────────────────────────────────────────

_producer: Optional[ANGProducer] = None

def get_producer() -> ANGProducer:
    global _producer
    if _producer is None:
        _producer = ANGProducer()
    return _producer
