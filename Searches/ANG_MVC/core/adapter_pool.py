"""
WarmAdapterPool — v3 P0 Critical Component

Keeps runtime adapters (especially heavy HF/LLM models) permanently loaded in memory.
Eliminates cold-start penalty on every inference.

Usage:
    from core.state import state
    infer_fn = await state.adapter_pool.get("runtime_adapter_hf")
    result = await infer_fn(prompt)
"""

import asyncio
import importlib
import logging
from typing import Callable, Awaitable, Dict

logger = logging.getLogger("ang.adapter_pool")

InferFn = Callable[[str], Awaitable[dict]]


class WarmAdapterPool:
    """
    Production-grade warm pool for runtime adapters.

    - Loads adapter entrypoint once per adapter_id
    - Keeps the async infer function in memory forever
    - Supports parallel preloading on startup
    - Thread-safe with per-adapter locks
    """

    def __init__(self, registry: dict | None = None):
        self._pool: Dict[str, InferFn] = {}
        self._locks: Dict[str, asyncio.Lock] = {}
        self._registry = registry or {}

    def update_registry(self, registry: dict):
        """Allow hot-reload of registry without losing already-warm adapters."""
        self._registry = registry

    async def get(self, adapter_id: str) -> InferFn:
        """Return a warm (or newly loaded) async infer function for the adapter."""
        if adapter_id in self._pool:
            return self._pool[adapter_id]

        # Per-adapter lock to prevent duplicate loading
        lock = self._locks.setdefault(adapter_id, asyncio.Lock())
        async with lock:
            if adapter_id in self._pool:          # double-check after acquiring lock
                return self._pool[adapter_id]

            infer_fn = await self._load_adapter(adapter_id)
            self._pool[adapter_id] = infer_fn
            logger.info("WarmAdapterPool: adapter '%s' loaded and kept warm", adapter_id)
            return infer_fn

    async def _load_adapter(self, adapter_id: str) -> InferFn:
        """Dynamically resolve and return the async infer function from registry."""
        adapters = self._registry.get("adapters", [])
        adapter = next((a for a in adapters if a["id"] == adapter_id), None)

        if not adapter:
            logger.warning("Adapter '%s' not found in registry — falling back to stub", adapter_id)
            adapter = next((a for a in adapters if a["id"] == "runtime_adapter_stub"), None)

        if not adapter:
            raise RuntimeError(f"No usable adapter found for id: {adapter_id}")

        module_name, fn_name = adapter["entrypoint"].split(":")
        try:
            module = importlib.import_module(module_name)
            infer_fn = getattr(module, fn_name)
            if not asyncio.iscoroutinefunction(infer_fn):
                # Wrap sync function to make it async (for older stubs)
                async def _wrapped(prompt: str):
                    return await asyncio.to_thread(infer_fn, prompt)
                return _wrapped
            return infer_fn
        except Exception as exc:
            logger.error("Failed to load adapter '%s': %s", adapter_id, exc)
            # Fallback to stub
            from adapters import runtime_adapter_stub
            return runtime_adapter_stub.infer

    async def preload_all(self, registry: dict | None = None):
        """Pre-load all adapters marked with 'preload': true (or all if none marked)."""
        if registry:
            self.update_registry(registry)

        adapters = self._registry.get("adapters", [])
        to_preload = [a for a in adapters if a.get("preload", False)] or adapters

        if not to_preload:
            logger.info("WarmAdapterPool: no adapters to preload")
            return

        logger.info("WarmAdapterPool: preloading %d adapters...", len(to_preload))
        tasks = [self.get(a["id"]) for a in to_preload]
        await asyncio.gather(*tasks, return_exceptions=True)
        logger.info("WarmAdapterPool: preloading complete. Warm adapters: %s", list(self._pool.keys()))

    def get_warm_adapters(self) -> list[str]:
        """Return list of currently warm adapter IDs (for admin/debug)."""
        return list(self._pool.keys())

    async def health(self) -> dict:
        """Return pool health for /admin/status."""
        return {
            "warm_adapters": self.get_warm_adapters(),
            "total_loaded": len(self._pool),
        }
