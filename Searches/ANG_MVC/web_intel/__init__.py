# ANG Web Intelligence Pipeline
# SearXNG → Kafka → Scrapy → Trafilatura → Qdrant → Qwen
from web_intel.web_rag import get_web_rag, WebRAG
from web_intel.searxng_client import get_searxng, SearXNGClient

__all__ = ["get_web_rag", "WebRAG", "get_searxng", "SearXNGClient"]
