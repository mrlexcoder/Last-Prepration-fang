"""
ANG Web RAG Orchestrator
The decision brain: model knowledge vs live web scrape.

Decision logic:
  1. Check if query needs fresh/live data (time-sensitive keywords, unknown entities)
  2. If yes → SearXNG search → parallel scrape → embed → retrieve → augment prompt
  3. If no → use model knowledge + Qdrant cache
  4. Always: multi-agent ensemble on final prompt
  5. High-confidence answers → Kafka training signal

Target: answer in <500ms for cached queries, <3s for fresh scrape.
"""

import asyncio
import logging
import os
import re
import time
from typing import Optional

logger = logging.getLogger("ang.web_rag")

# Keywords that signal need for live web data
LIVE_TRIGGERS = [
    r"\b(today|yesterday|this week|this month|latest|recent|current|now|2024|2025|2026)\b",
    r"\b(news|breaking|update|release|launch|announce|announced)\b",
    r"\b(price|stock|weather|score|result|winner|standings)\b",
    r"\b(who is|what is .+ doing|where is .+ now)\b",
    r"\b(himachal|pradesh|india|state|government|minister|election|policy)\b",
    r"\b(match|game|tournament|championship|league|ipl|cricket|football)\b",
    r"\b(earthquake|flood|disaster|accident|incident|attack|protest)\b",
]
_LIVE_RE = re.compile("|".join(LIVE_TRIGGERS), re.IGNORECASE)

SCRAPE_TIMEOUT   = float(os.getenv("WEB_RAG_SCRAPE_TIMEOUT", "4.0"))
MAX_SCRAPE_URLS  = int(os.getenv("WEB_RAG_MAX_URLS", "8"))
MIN_CHUNK_SCORE  = float(os.getenv("WEB_RAG_MIN_SCORE", "0.35"))
CONTEXT_CHUNKS   = int(os.getenv("WEB_RAG_CONTEXT_CHUNKS", "6"))


def _needs_live_data(query: str) -> bool:
    return bool(_LIVE_RE.search(query))


def _build_rag_prompt(query: str, chunks: list[dict], sources: list[str]) -> str:
    if not chunks:
        return query

    context_lines = []
    for i, c in enumerate(chunks[:CONTEXT_CHUNKS]):
        url = c.get("url", "")
        text = c.get("chunk", "")
        context_lines.append(f"[{i+1}] ({url})\n{text}")

    context = "\n\n".join(context_lines)
    source_list = "\n".join(f"- {s}" for s in sources[:10])

    return (
        f"You are an expert AI assistant with access to real-time web data.\n"
        f"Use the following retrieved web content to answer accurately.\n\n"
        f"=== Retrieved Web Context ===\n{context}\n\n"
        f"=== Sources ===\n{source_list}\n\n"
        f"=== Question ===\n{query}\n\n"
        f"Answer based on the web context above. "
        f"If the context doesn't fully answer the question, use your knowledge to supplement. "
        f"Be specific, accurate, and cite sources where relevant."
    )


class WebRAG:
    """
    Full web-augmented retrieval pipeline.
    Integrates SearXNG + Scrapy + Trafilatura + Qdrant + Qwen.
    """

    def __init__(self, infer_fn):
        self._infer = infer_fn
        self._scraper = None
        self._embedder = None
        self._searxng = None
        self._producer = None

    def _get_scraper(self):
        if self._scraper is None:
            from web_intel.scraper import WebScraper
            self._scraper = WebScraper()
        return self._scraper

    def _get_embedder(self):
        if self._embedder is None:
            from web_intel.embedder import get_embedder
            self._embedder = get_embedder()
        return self._embedder

    def _get_searxng(self):
        if self._searxng is None:
            from web_intel.searxng_client import get_searxng
            self._searxng = get_searxng()
        return self._searxng

    def _get_producer(self):
        if self._producer is None:
            from web_intel.kafka_bus import get_producer
            self._producer = get_producer()
        return self._producer

    async def answer(
        self,
        query: str,
        runtime_hint: Optional[str] = None,
        user_id: str = "default",
        force_live: bool = False,
    ) -> dict:
        t0 = time.perf_counter()
        live = force_live or _needs_live_data(query)
        sources: list[str] = []
        chunks: list[dict] = []

        # ── Step 1: Check Qdrant cache first (always fast) ────────────────────
        embedder = self._get_embedder()
        cached_chunks = embedder.search(query, top_k=CONTEXT_CHUNKS, score_threshold=MIN_CHUNK_SCORE)

        if cached_chunks and not live:
            # Good cache hit — no need to scrape
            chunks = cached_chunks
            sources = list({c["url"] for c in chunks})
            logger.info("web_rag: cache hit (%d chunks) for: %s", len(chunks), query[:60])
        else:
            # ── Step 2: SearXNG → get URLs ────────────────────────────────────
            searxng = self._get_searxng()
            search_results = await searxng.search(query, max_results=MAX_SCRAPE_URLS)

            if not search_results:
                logger.warning("web_rag: no search results for '%s' — answering from model only", query[:60])
            else:
                urls = [r["url"] for r in search_results[:MAX_SCRAPE_URLS]]
                sources = urls

                # Use snippets immediately as context — available before scraping
                for r in search_results:
                    if r.get("snippet") and len(r["snippet"]) > 30:
                        chunks.append({
                            "url": r["url"],
                            "title": r.get("title", ""),
                            "chunk": f"{r.get('title', '')}: {r['snippet']}",
                            "score": 0.55,
                        })

                # ── Step 3: Parallel scrape with timeout ──────────────────────
                producer = self._get_producer()
                scraper = self._get_scraper()

                try:
                    scraped = await asyncio.wait_for(
                        scraper.scrape_many(urls, query, producer),
                        timeout=SCRAPE_TIMEOUT,
                    )
                    for url, url_chunks in scraped.items():
                        for i, chunk in enumerate(url_chunks):
                            chunks.append({"url": url, "chunk": chunk, "score": 0.65})

                    # ── Step 4: Embed + index scraped chunks ──────────────────
                    if scraped:
                        flat = [
                            {"url": u, "chunk": c, "query": query, "chunk_idx": i}
                            for u, cs in scraped.items()
                            for i, c in enumerate(cs)
                        ]
                        loop = asyncio.get_event_loop()
                        await loop.run_in_executor(None, embedder.upsert_chunks, flat)
                        fresh = embedder.search(query, top_k=CONTEXT_CHUNKS)
                        if fresh:
                            chunks = fresh + chunks[:3]

                except asyncio.TimeoutError:
                    logger.warning("web_rag: scrape timeout — using snippets only")
                except Exception as exc:
                    logger.warning("web_rag: scrape error: %s — using snippets only", exc)

        # ── Step 5: Build RAG prompt ──────────────────────────────────────────
        # Deduplicate and rank chunks by score
        seen = set()
        deduped = []
        for c in sorted(chunks, key=lambda x: x.get("score", 0), reverse=True):
            key = c["chunk"][:100]
            if key not in seen:
                seen.add(key)
                deduped.append(c)

        rag_prompt = _build_rag_prompt(query, deduped[:CONTEXT_CHUNKS], sources)

        # ── Step 6: Infer with ensemble ───────────────────────────────────────
        import inspect
        sig = inspect.signature(self._infer)
        if "runtime_hint" in sig.parameters:
            result = await self._infer(rag_prompt, runtime_hint=runtime_hint)
        else:
            result = await self._infer(rag_prompt)

        output = result.get("output", "")
        confidence = result.get("confidence", 0.5)
        total_ms = (time.perf_counter() - t0) * 1000

        logger.info(
            "web_rag: query='%s' live=%s chunks=%d conf=%.2f latency=%.0fms",
            query[:50], live, len(deduped), confidence, total_ms
        )

        # ── Step 7: High-quality → training signal ────────────────────────────
        if confidence >= 0.75 and output:
            try:
                producer = self._get_producer()
                await producer.send_train_signal(
                    prompt=query,
                    completion=output,
                    quality=confidence,
                    source="web_rag",
                )
            except Exception:
                pass

        return {
            "output": output,
            "confidence": confidence,
            "sources": sources[:10],
            "chunks_used": len(deduped),
            "live_scrape": live,
            "latency_ms": round(total_ms, 1),
            "runtime": result.get("meta", {}).get("provider", "unknown"),
        }


# Singleton
_web_rag: Optional[WebRAG] = None

def get_web_rag(infer_fn=None) -> WebRAG:
    global _web_rag
    if _web_rag is None:
        if infer_fn is None:
            raise ValueError("infer_fn required on first call")
        _web_rag = WebRAG(infer_fn=infer_fn)
    return _web_rag
