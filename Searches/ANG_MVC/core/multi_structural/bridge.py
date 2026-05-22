"""
Multi-Structural Bridge
Composable execution modes: chat | search | tools | pipeline

Each mode wraps the same neurone-mesh call but shapes the prompt,
post-processes the output, and optionally hits the InfinityCache.
"""

import logging
from typing import Any, Callable, Awaitable

logger = logging.getLogger("ang.multi_structural")

# Type alias for the infer function injected at runtime
InferFn = Callable[[str], Awaitable[dict]]


class MultiStructuralBridge:
    """
    Usage:
        bridge = MultiStructuralBridge(infer_fn=neurone_mesh.run)
        result = await bridge.execute(mode="chat", payload={...})
    """

    MODES = ("chat", "search", "tools", "pipeline")

    def __init__(self, infer_fn, cache=None):
        self._infer = infer_fn
        self._cache = cache

    async def _call(self, prompt: str, runtime_hint: str | None = None) -> dict:
        """Call infer_fn, passing runtime_hint if the function accepts it."""
        import inspect
        sig = inspect.signature(self._infer)
        if "runtime_hint" in sig.parameters:
            return await self._infer(prompt, runtime_hint=runtime_hint)
        return await self._infer(prompt)

    async def execute(self, mode: str, payload: dict) -> dict:
        if mode not in self.MODES:
            raise ValueError(f"Unknown mode '{mode}'. Choose from {self.MODES}")
        handler = getattr(self, f"_mode_{mode}")
        logger.info("multi-structural bridge: mode=%s", mode)
        return await handler(payload)

    # ------------------------------------------------------------------ #
    #  Modes                                                               #
    # ------------------------------------------------------------------ #

    async def _mode_chat(self, payload: dict) -> dict:
        user_input = payload.get("input", "")
        history = payload.get("history", [])
        hint = payload.get("runtime_hint")

        context_snippets = []
        if self._cache:
            hits = self._cache.search(user_input, top_k=3)
            context_snippets = [
                h["summary"] for h in hits
                if not h["summary"].startswith("[stub]")
                and not h["summary"].startswith("[hf-stub]")
                and not h["summary"].startswith("[llama-stub]")
                and len(h["summary"]) > 20
            ]

        prompt = self._build_chat_prompt(user_input, history, context_snippets)
        result = await self._call(prompt, runtime_hint=hint)
        answer = result.get("output", "")

        if self._cache and answer and not answer.startswith("[stub]"):
            self._cache.store(
                text=f"Q: {user_input}\nA: {answer}",
                summary=answer[:120],
            )

        return {"mode": "chat", "output": answer, "confidence": result.get("confidence"),
                "runtime": result.get("meta", {}).get("provider", "unknown")}

    async def _mode_search(self, payload: dict) -> dict:
        query = payload.get("input", "")
        hint = payload.get("runtime_hint")
        hits = []
        if self._cache:
            hits = self._cache.search(query, top_k=5)

        context = "\n".join(f"- {h['summary']}" for h in hits) or "No prior context."
        prompt = (
            f"Context from memory:\n{context}\n\n"
            f"Answer the following based on the context above:\n{query}"
        )
        result = await self._call(prompt, runtime_hint=hint)
        return {
            "mode": "search",
            "output": result.get("output"),
            "sources": [h["id"] for h in hits],
            "confidence": result.get("confidence"),
        }

    async def _mode_tools(self, payload: dict) -> dict:
        user_input = payload.get("input", "")
        hint = payload.get("runtime_hint")
        available_tools = payload.get("tools", [])
        tools_desc = "\n".join(f"- {t}" for t in available_tools) or "No tools registered."
        prompt = (
            f"Available tools:\n{tools_desc}\n\n"
            f"Decide which tool to call (or none) and explain your reasoning.\n"
            f"Request: {user_input}"
        )
        result = await self._call(prompt, runtime_hint=hint)
        called_tool = next(
            (t for t in available_tools if t.lower() in result.get("output", "").lower()),
            None,
        )
        return {
            "mode": "tools",
            "output": result.get("output"),
            "called_tool": called_tool,
            "confidence": result.get("confidence"),
        }

    async def _mode_pipeline(self, payload: dict) -> dict:
        steps = payload.get("steps", [payload.get("input", "")])
        hint = payload.get("runtime_hint")
        results = []
        last_output = ""
        for i, step in enumerate(steps):
            prompt = step if i == 0 else f"Previous: {last_output}\nNext step: {step}"
            result = await self._call(prompt, runtime_hint=hint)
            last_output = result.get("output", "")
            results.append({"step": i + 1, "prompt": step, "output": last_output})
        return {
            "mode": "pipeline",
            "steps_run": len(results),
            "final_output": last_output,
            "pipeline": results,
        }

    # ------------------------------------------------------------------ #
    #  Helpers                                                             #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _build_chat_prompt(user_input: str, history: list, context: list) -> str:
        parts = []
        if context:
            parts.append("Memory context:\n" + "\n".join(f"  • {c}" for c in context))
        if history:
            parts.append("Conversation history:")
            for turn in history[-6:]:   # last 3 exchanges
                parts.append(f"  User: {turn.get('user', '')}")
                parts.append(f"  Assistant: {turn.get('assistant', '')}")
        parts.append(f"User: {user_input}")
        return "\n".join(parts)
