"""
ANG Auto-Trainer — Phase 3
Unsloth-powered 24/7 fine-tuning on 4 GPUs.

Flow:
  1. Poll Go store for high-quality training samples (quality >= 0.75)
  2. When enough samples accumulate (MIN_SAMPLES), trigger a training run
  3. Fine-tune with Unsloth LoRA on 4 GPUs
  4. Save adapter, hot-swap into inference path
  5. Sleep, repeat

Runs as a background daemon process.
"""

import asyncio
import json
import logging
import os
import time
from pathlib import Path
from typing import Optional

logger = logging.getLogger("ang.auto_trainer")

# ─── Config ───────────────────────────────────────────────────────────────────

BASE_MODEL     = os.getenv("ANG_BASE_MODEL", "unsloth/Qwen2.5-7B-Instruct-bnb-4bit")
ADAPTER_DIR    = Path(os.getenv("ANG_ADAPTER_DIR", "/data/ang_adapters"))
MIN_SAMPLES    = int(os.getenv("ANG_TRAIN_MIN_SAMPLES", "50"))
POLL_INTERVAL  = int(os.getenv("ANG_TRAIN_POLL_SECS", "300"))   # 5 min
MAX_STEPS      = int(os.getenv("ANG_TRAIN_MAX_STEPS", "200"))
NUM_GPUS       = int(os.getenv("ANG_NUM_GPUS", "4"))
LORA_RANK      = int(os.getenv("ANG_LORA_RANK", "16"))
BATCH_SIZE     = int(os.getenv("ANG_TRAIN_BATCH", "4"))
GRAD_ACCUM     = int(os.getenv("ANG_GRAD_ACCUM", "4"))
LEARNING_RATE  = float(os.getenv("ANG_LR", "2e-4"))
MIN_QUALITY    = float(os.getenv("ANG_MIN_QUALITY", "0.75"))


def _format_sample(prompt: str, completion: str) -> dict:
    """Format as Alpaca-style instruction."""
    return {
        "instruction": prompt,
        "input": "",
        "output": completion,
    }


def _build_dataset(samples: list[dict]):
    """Convert storage samples to HuggingFace Dataset."""
    from datasets import Dataset
    records = [_format_sample(s["prompt"], s["completion"]) for s in samples]
    return Dataset.from_list(records)


def _get_formatting_fn(tokenizer):
    """Alpaca prompt template."""
    alpaca_prompt = (
        "Below is an instruction that describes a task. "
        "Write a response that appropriately completes the request.\n\n"
        "### Instruction:\n{}\n\n### Response:\n{}"
    )
    eos = tokenizer.eos_token

    def formatting_prompts_func(examples):
        texts = []
        for inst, out in zip(examples["instruction"], examples["output"]):
            texts.append(alpaca_prompt.format(inst, out) + eos)
        return {"text": texts}

    return formatting_prompts_func


def run_training_run(samples: list[dict], run_id: str) -> Optional[Path]:
    """
    Execute one Unsloth LoRA fine-tuning run.
    Returns path to saved adapter or None on failure.
    """
    try:
        from unsloth import FastLanguageModel
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from unsloth import is_bfloat16_supported
    except ImportError as exc:
        logger.error("Unsloth/TRL not installed: %s", exc)
        return None

    logger.info("Training run %s: %d samples, model=%s", run_id, len(samples), BASE_MODEL)

    # Load model with Unsloth 4-bit quantization
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=BASE_MODEL,
        max_seq_length=2048,
        dtype=None,           # auto-detect bf16/fp16
        load_in_4bit=True,
    )

    # Apply LoRA
    model = FastLanguageModel.get_peft_model(
        model,
        r=LORA_RANK,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                        "gate_proj", "up_proj", "down_proj"],
        lora_alpha=LORA_RANK * 2,
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
    )

    dataset = _build_dataset(samples)
    formatting_fn = _get_formatting_fn(tokenizer)

    adapter_path = ADAPTER_DIR / run_id
    adapter_path.mkdir(parents=True, exist_ok=True)

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        formatting_func=formatting_fn,
        max_seq_length=2048,
        dataset_num_proc=4,
        args=TrainingArguments(
            per_device_train_batch_size=BATCH_SIZE,
            gradient_accumulation_steps=GRAD_ACCUM,
            warmup_steps=10,
            max_steps=MAX_STEPS,
            learning_rate=LEARNING_RATE,
            fp16=not is_bfloat16_supported(),
            bf16=is_bfloat16_supported(),
            logging_steps=10,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="cosine",
            output_dir=str(adapter_path / "checkpoints"),
            save_strategy="no",
            dataloader_num_workers=4,
            # 4-GPU data parallel
            ddp_find_unused_parameters=False,
        ),
    )

    trainer.train()

    # Save LoRA adapter
    model.save_pretrained(str(adapter_path / "lora"))
    tokenizer.save_pretrained(str(adapter_path / "lora"))

    # Write run metadata
    meta = {
        "run_id": run_id,
        "samples": len(samples),
        "base_model": BASE_MODEL,
        "adapter_path": str(adapter_path / "lora"),
        "completed_at": time.time(),
        "max_steps": MAX_STEPS,
    }
    (adapter_path / "meta.json").write_text(json.dumps(meta, indent=2))

    logger.info("Training run %s complete → %s", run_id, adapter_path / "lora")
    return adapter_path / "lora"


def notify_hot_swap(adapter_path: Path):
    """Tell the inference layer to load the new adapter."""
    try:
        from core.state import state
        if hasattr(state, "active_adapter_path"):
            state.active_adapter_path = str(adapter_path)
            logger.info("Hot-swapped adapter: %s", adapter_path)
    except Exception as exc:
        logger.warning("Hot-swap notification failed: %s", exc)

    # Also write to a well-known file so other processes can pick it up
    marker = ADAPTER_DIR / "latest_adapter.txt"
    marker.write_text(str(adapter_path))


async def training_daemon():
    """
    Main 24/7 training loop.
    Polls for new samples, trains when threshold met.
    """
    ADAPTER_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("Auto-trainer daemon started (poll=%ds, min_samples=%d, gpus=%d)",
                POLL_INTERVAL, MIN_SAMPLES, NUM_GPUS)

    run_counter = 0

    while True:
        try:
            from core.storage_client import get_storage
            storage = get_storage()
            samples = storage.get_training_queue(min_quality=MIN_QUALITY)

            logger.info("Training poll: %d samples available (need %d)", len(samples), MIN_SAMPLES)

            if len(samples) >= MIN_SAMPLES:
                run_id = f"run_{int(time.time())}_{run_counter:04d}"
                run_counter += 1

                # Run training in thread pool to not block event loop
                loop = asyncio.get_event_loop()
                adapter_path = await loop.run_in_executor(
                    None, run_training_run, samples[:2000], run_id
                )

                if adapter_path:
                    notify_hot_swap(adapter_path)
                    logger.info("Run %s complete, adapter at %s", run_id, adapter_path)
                else:
                    logger.warning("Run %s failed", run_id)

        except Exception as exc:
            logger.error("Training daemon error: %s", exc, exc_info=True)

        await asyncio.sleep(POLL_INTERVAL)


def start_training_daemon():
    """Start daemon in background thread with its own event loop."""
    import threading

    def _run():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(training_daemon())

    t = threading.Thread(target=_run, daemon=True, name="ang-auto-trainer")
    t.start()
    logger.info("Auto-trainer daemon thread started")
    return t


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(training_daemon())
