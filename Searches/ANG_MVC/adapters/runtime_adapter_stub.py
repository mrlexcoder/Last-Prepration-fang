import asyncio

async def infer(prompt: str) -> dict:
    await asyncio.sleep(0.01)
    return {
        "output": f"[stub] fast answer for: {prompt}",
        "confidence": 0.92,
        "meta": {"provider": "stub", "speed": "very_fast"}
    }
