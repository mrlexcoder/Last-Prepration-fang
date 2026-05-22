"""
runtime_adapter_hf — HuggingFace Transformers adapter (Qwen2.5 + any HF model).

Uses the model's chat template for proper instruction-following.
Hardware-aware: CUDA if available, else CPU.
Lazy-loads on first call. Graceful stub fallback if transformers not installed.

Config via env:
  ANG_HF_MODEL      — model id (default: Qwen/Qwen2.5-0.5B-Instruct)
  ANG_HF_MAX_TOKENS — max new tokens (default: 512)
"""

import asyncio
import logging
import os
import time
from functools import lru_cache

logger = logging.getLogger("ang.adapter.hf")

DEFAULT_MODEL = os.getenv("ANG_HF_MODEL", "Qwen/Qwen2.5-0.5B-Instruct")
MAX_NEW_TOKENS = int(os.getenv("ANG_HF_MAX_TOKENS", "512"))


@lru_cache(maxsize=1)
def _load_model():
    """Load tokenizer + model once, cache forever."""
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info("loading %s on %s", DEFAULT_MODEL, device)

        tokenizer = AutoTokenizer.from_pretrained(
            DEFAULT_MODEL, trust_remote_code=True
        )
        model = AutoModelForCausalLM.from_pretrained(
            DEFAULT_MODEL,
            torch_dtype="auto",
            device_map="auto",
            trust_remote_code=True,
        )
        model.eval()
        logger.info("model loaded: %s on %s", DEFAULT_MODEL, device)
        return tokenizer, model, device
    except Exception as exc:
        logger.warning("HF model load failed (%s) — stub mode", exc)
        return None, None, "stub"


async def infer(prompt: str) -> dict:
    loop = asyncio.get_event_loop()
    start = time.perf_counter()
    result = await loop.run_in_executor(None, _blocking_infer, prompt)
    result["meta"]["latency_ms"] = round((time.perf_counter() - start) * 1000, 1)
    return result


def _blocking_infer(prompt: str) -> dict:
    tokenizer, model, device = _load_model()

    if model is None:
        return {
            "output": f"[hf-stub] transformers not ready. Prompt: {prompt[:60]}",
            "confidence": 0.65,
            "meta": {"provider": "hf-stub", "model": DEFAULT_MODEL, "device": "stub"},
        }

    try:
        import torch

        # Build chat messages — use system + user format for instruction models
        messages = [
            {"role": "system", "content": "You are AuroraNeuroGrid, a helpful and concise AI assistant."},
            {"role": "user", "content": prompt},
        ]

        # Apply chat template
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = tokenizer([text], return_tensors="pt").to(model.device)

        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=MAX_NEW_TOKENS,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id,
            )

        # Decode only the newly generated tokens (strip the input)
        new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
        answer = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

        return {
            "output": answer,
            "confidence": 0.88,
            "meta": {"provider": "huggingface", "model": DEFAULT_MODEL, "device": device},
        }

    except Exception as exc:
        logger.error("HF inference error: %s", exc)
        return {
            "output": f"[hf-error] {str(exc)[:120]}",
            "confidence": 0.0,
            "meta": {"provider": "huggingface", "model": DEFAULT_MODEL, "error": str(exc)},
        }


async def health() -> dict:
    _, _, device = _load_model()
    return {"adapter": "runtime_adapter_hf", "model": DEFAULT_MODEL, "device": device}
