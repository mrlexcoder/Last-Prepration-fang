import asyncio

async def infer(input_text: str) -> dict:
    # Simulate a very fast local runtime inference with deterministic response
    await asyncio.sleep(0.01)  # 10ms simulated work
    return {
        "output": f"[stub answer] {input_text}",
        "confidence": 0.85,
        "meta": {"stub": True}
    }
