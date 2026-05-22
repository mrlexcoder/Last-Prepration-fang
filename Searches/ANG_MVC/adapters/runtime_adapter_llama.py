"""
runtime_adapter_llama — llama.cpp runtime adapter.

Communication strategy:
  1. If llama-cpp-python is installed → use it directly (fastest, in-process).
  2. Else if llama.cpp binary exists at ANG_LLAMA_BIN → subprocess call.
  3. Else → graceful stub fallback.

Config via env:
  ANG_LLAMA_BIN   — path to llama.cpp main binary (default: /usr/local/bin/llama)
  ANG_LLAMA_MODEL — path to GGUF model file (default: /models/llama.gguf)
  ANG_LLAMA_CTX   — context size (default: 2048)
  ANG_LLAMA_THREADS — CPU threads (default: 4)
"""

import asyncio
import logging
import os
import time
from functools import lru_cache

logger = logging.getLogger("ang.adapter.llama")

LLAMA_BIN = os.getenv("ANG_LLAMA_BIN", "/usr/local/bin/llama")
LLAMA_MODEL = os.getenv("ANG_LLAMA_MODEL", "/models/llama.gguf")
LLAMA_CTX = int(os.getenv("ANG_LLAMA_CTX", "2048"))
LLAMA_THREADS = int(os.getenv("ANG_LLAMA_THREADS", "4"))
MAX_TOKENS = int(os.getenv("ANG_LLAMA_MAX_TOKENS", "256"))


@lru_cache(maxsize=1)
def _detect_backend() -> str:
    """Detect which backend is available: python_binding | subprocess | stub"""
    try:
        import llama_cpp  # noqa: F401
        logger.info("llama.cpp backend: python_binding (llama-cpp-python)")
        return "python_binding"
    except ImportError:
        pass
    if os.path.isfile(LLAMA_BIN) and os.path.isfile(LLAMA_MODEL):
        logger.info("llama.cpp backend: subprocess (%s)", LLAMA_BIN)
        return "subprocess"
    logger.warning("llama.cpp backend: stub (no binary or model found)")
    return "stub"


@lru_cache(maxsize=1)
def _load_llama_python():
    """Load llama-cpp-python model once."""
    from llama_cpp import Llama
    logger.info("loading llama model: %s", LLAMA_MODEL)
    return Llama(
        model_path=LLAMA_MODEL,
        n_ctx=LLAMA_CTX,
        n_threads=LLAMA_THREADS,
        verbose=False,
    )


async def infer(prompt: str) -> dict:
    loop = asyncio.get_event_loop()
    start = time.perf_counter()
    result = await loop.run_in_executor(None, _blocking_infer, prompt)
    result["meta"]["latency_ms"] = round((time.perf_counter() - start) * 1000, 1)
    return result


def _blocking_infer(prompt: str) -> dict:
    backend = _detect_backend()

    if backend == "python_binding":
        return _infer_python_binding(prompt)
    elif backend == "subprocess":
        return _infer_subprocess(prompt)
    else:
        return _infer_stub(prompt)


def _infer_python_binding(prompt: str) -> dict:
    try:
        llm = _load_llama_python()
        output = llm(prompt, max_tokens=MAX_TOKENS, stop=["</s>", "\n\n"])
        text = output["choices"][0]["text"].strip()
        return {
            "output": text,
            "confidence": 0.85,
            "meta": {"provider": "llama.cpp", "backend": "python_binding", "model": LLAMA_MODEL},
        }
    except Exception as exc:
        logger.error("llama python_binding error: %s", exc)
        return _infer_stub(prompt, error=str(exc))


def _infer_subprocess(prompt: str) -> dict:
    import subprocess
    try:
        cmd = [
            LLAMA_BIN,
            "-m", LLAMA_MODEL,
            "-p", prompt,
            "-n", str(MAX_TOKENS),
            "-t", str(LLAMA_THREADS),
            "--ctx-size", str(LLAMA_CTX),
            "-e",   # escape newlines
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        output = proc.stdout.strip()
        # llama.cpp echoes the prompt — strip it
        if output.startswith(prompt):
            output = output[len(prompt):].strip()
        return {
            "output": output or "[empty response]",
            "confidence": 0.80,
            "meta": {"provider": "llama.cpp", "backend": "subprocess", "model": LLAMA_MODEL},
        }
    except Exception as exc:
        logger.error("llama subprocess error: %s", exc)
        return _infer_stub(prompt, error=str(exc))


def _infer_stub(prompt: str, error: str = "") -> dict:
    return {
        "output": f"[llama-stub] {prompt[:80]}",
        "confidence": 0.60,
        "meta": {
            "provider": "llama.cpp",
            "backend": "stub",
            "note": "Install llama-cpp-python or set ANG_LLAMA_BIN/ANG_LLAMA_MODEL",
            "error": error,
        },
    }


async def health() -> dict:
    backend = _detect_backend()
    return {
        "adapter": "runtime_adapter_llama",
        "backend": backend,
        "model": LLAMA_MODEL,
        "bin": LLAMA_BIN,
    }
