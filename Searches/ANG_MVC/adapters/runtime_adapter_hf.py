"""
runtime_adapter_hf — HuggingFace Transformers runtime adapter.

Hardware-aware:
  - Uses CUDA if available, falls back to CPU.
  - Loads model lazily on first call (no startup penalty).
  - Graceful fallback to stub output if transformers not installed.

Default model: Qwen/Qwen2.5-0.5B-Instruct (tiny, CPU-runnable)
Override via env: ANG_HF_MODEL=<model_id>
"""

import asyncio
import logging
import os
import time
from functools import lru_cache

logger = logging.getLogger("ang.adapter.hf")

# Model to load — override with env var for larger models
DEFAULT_MODEL = os.getenv("ANG_HF_MODEL", "Qwen/Qwen2.5-0.5B-Instruct")
MAX_NEW_TOKENS = int(os.getenv("ANG_HF_MAX_TOKENS", "256"))


@lru_cache(maxsize=1)
def _load_pipeline():
    """Load the HF pipeline once and cache it."""
    try:
        import torch
        from transformers import pipeline as hf_pipeline

        device = 0 if torch.cuda.is_available() else -1
        device_name = "CUDA" if device == 0 else "CPU"
        logger.info("loading HF model %s on %s", DEFAULT_MODEL, device_name)

        pipe = hf_pipeline(
            "text-generation",
            model=DEFAULT_MODEL,
            device=device,
            torch_dtype="auto",
            trust_remote_code=True,
        )
        logger.info("HF model loaded: %s", DEFAULT_MODEL)
        return pipe, device_name
    except Exception as exc:
        logger.warning("HF pipeline load failed (%s) — stub mode active", exc)
        return None, "stub"


async def infer(prompt: str) -> dict:
    loop = asyncio.get_event_loop()
    start = time.perf_counter()

    # Run blocking inference in thread pool to keep FastAPI non-blocking
    result = await loop.run_in_executor(None, _blocking_infer, prompt)

    latency_ms = (time.perf_counter() - start) * 1000
    result["meta"]["latency_ms"] = round(latency_ms, 1)
    return result


def _blocking_infer(prompt: str) -> dict:
    pipe, device_name = _load_pipeline()

    if pipe is None:
        # Graceful stub fallback
        return {
            "output": f"[hf-stub] {prompt[:80]}",
            "confidence": 0.70,
            "meta": {"provider": "hf-stub", "model": DEFAULT_MODEL, "device": "stub"},
        }

    try:
        outputs = pipe(
            prompt,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=True,
            temperature=0.7,
            pad_token_id=pipe.tokenizer.eos_token_id,
        )
        generated = outputs[0]["generated_text"]
        # Strip the prompt prefix if the model echoes it
        if generated.startswith(prompt):
            generated = generated[len(prompt):].strip()

        return {
            "output": generated,
            "confidence": 0.82,
            "meta": {"provider": "huggingface", "model": DEFAULT_MODEL, "device": device_name},
        }
    except Exception as exc:
        logger.error("HF inference error: %s", exc)
        return {
            "output": f"[hf-error] {str(exc)[:120]}",
            "confidence": 0.0,
            "meta": {"provider": "huggingface", "model": DEFAULT_MODEL, "error": str(exc)},
        }


async def health() -> dict:
    _, device_name = _load_pipeline()
    return {"adapter": "runtime_adapter_hf", "model": DEFAULT_MODEL, "device": device_name}
