import asyncio

async def infer(prompt: str) -> dict:
    await asyncio.sleep(0.05)
    return {
        "output": f"[qwen-stub] instructive answer for: {prompt}",
        "confidence": 0.88,
        "meta": {"provider": "qwen", "model": "Qwen2.5-4B-Instruct"}
    }
