# AuroraNeuroGrid — Detailed Architecture (Real Implementation, May 2026)

This is the **actual** architecture as it exists in the running code, not the aspirational 2025 vision.

## 1. Layered View (Bottom → Top)

### Physical / Native Layer
- Rust ring buffer (`storage/rust_ringbuf/`) — ultra-low-latency ring buffer for hot data.
- Go gRPC store (`storage/go_store/`) — persistent high-speed key-value + streaming.
- These are called via `core/storage_client.py`.

### Device & Runtime Layer
- `device_manager.py` — respects 50% VRAM cap on low-memory GPUs (RTX 5050 etc.).
- WarmAdapterPool (`adapter_pool.py`) — the single most important latency win. Loads adapters once and keeps them warm forever.
- Runtime adapters (`adapters/`) declared in `connectors/registry.json`:
  - `runtime_adapter_stub` (instant)
  - `runtime_adapter_hf` (Qwen 2.5 4B/0.5B)
  - `runtime_adapter_llama` (llama.cpp)
  - `runtime_adapter_agentscope` (full multi-agent framework)

### Quantum Routing Layer
`quantum_router.py` + `state.py`:
- Hot-reloadable registry.
- v3 Pro scoring that heavily prefers real instruction/chat models.
- Explicit latency budget + capability awareness.
- Single function `select_runtime()` used everywhere.

### Core Orchestration (Neurone Mesh)
`neurone_mesh.py`:
- The only place that actually calls inference.
- Always goes through warm pool when available.
- Records every outcome into WorldModel + MetaCognition (non-blocking).
- This is the "spinal cord" of the system.

### Cognitive Architecture (The Real AGI Brain)

#### WorldModel (`agi/world_model.py`)
- Entities + attributes + timestamps.
- Causal edges (cause → effect + confidence).
- Lightweight simulation.
- **Pro feature**: `counterfactual()` + `run_multiple_simulations()` — true multi-path "what-if" reasoning.

#### GoalEngine (`agi/goal_engine.py`)
- Hierarchical goal tree (BabyAGI style).
- Intrinsic reward = priority × novelty.
- `IntrinsicCuriosityModule` that rewards high prediction error (drives exploration and multi-calc thinking).

#### MetaCognition (`agi/meta_cognition.py`)
- Belief store with Bayesian-style blending.
- Self-model per (runtime, mode).
- Reflexion loop: expected vs actual → critique → belief revision.
- `full_reflect()` — the pro version that runs counterfactuals and emits high-quality learning signals.

#### CMU Router (`cmu_router.py`)
This is the key "multiple calculations" intelligence:
- CMU-0: Spinal reflex (exact cache, <1 ms)
- CMU-1: Fast single model
- CMU-2: Chain-of-thought + critic (2 calculations)
- CMU-3: Full ensemble (4–5 parallel agents + synthesis)
- CMU-4: Full AGI mode (curiosity, counterfactuals, Reflexion, AgentScope, etc.)

The router decides **at runtime** whether the query justifies the cost of many parallel neural calculations.

### Ultra-Fast Physics Brain (`fast_decision_engine.py`)
- Target: <30 ms end-to-end.
- Uses QuantumPhysicsEngine (loaded from sibling `Machine_understanding/delta/math/`) for:
  - Future state prediction
  - Action value computation
  - Recursive future question simulation
- Continuous micro-learning from slow responses.
- Infinite self-correction loop when targets missed.
- Vision state injection (from Delta) for grounded decisions.

### Multi-Structural Bridge (`multi_structural/bridge.py`)
The "universal executor". Supports 8 modes:
`chat | search | tools | pipeline | web | agentscope | think | agi`

It lazily loads:
- MultiAgentEnsemble
- Mem0
- Letta
- Storage
- WorldModel + GoalEngine + MetaCognition
- FastApproximator + UltraFastDecisionEngine

It is the main entry point for almost all high-level work.

### Pro AGI Master — God Mode (`pro_agi_master.py` + `pro_agi_tools.py`)
This is the highest-level intelligence.

Capabilities it actually has today:
- Full desktop vision + control via Delta v4.344
- Can call any of 30+ god-mode tools (edit code, train adapters, restart server, push to GitHub, kill processes, install packages, full system diagnosis, etc.)
- Runs infinite autonomous loop on every boot (`start_autonomous_mode`)
- Aggressive self-improvement every cycle (`self_improve`)
- LaptopObserver integration — literally watches everything you do in real time
- Can decide to use tools autonomously

This agent is closer to "strong decision maker that can write its own code" than almost anything else in open source right now.

### Continuous Learning & Self-Generation
- `training/auto_learner.py` + `AutoBuilder` — 3-track continuous learning + autonomous code generation.
- `web_intel/scraper_grid.py` — 24/7 harvesting of science/math/biology/neural concepts to feed auto-generation.
- Auto-trainer daemon (Unsloth fine-tuning 24/7 when enabled).

### Environment Awareness
`laptop_observer.py`:
- Running processes, active windows, Chrome tabs, VS Code state, user activity.
- Generates human-readable summary.
- Fed directly into WorldModel and Pro AGI for grounded, real-time understanding.

## 2. Data Flow (Typical Request)

1. HTTP → controller → service
2. `select_runtime()` (quantum_router) using current registry + latency budget
3. Warm pool returns already-loaded infer function (or loads it once)
4. Neurone mesh calls it → records outcome
5. CMU router may have already decided to run ensemble or full AGI path
6. Bridge may have injected Mem0, Letta, world model, curiosity, etc.
7. Results stored in InfinityCache (if high quality)
8. MetaCognition reflects and may emit learning signal
9. Pro AGI may be watching and decide to self-improve based on the outcome

## 3. Why It Already Feels "Pro"

- Warm pool + quantum router = very low effective latency
- CMU router = only pays for multiple calculations when the problem justifies it
- Physics fast path = sub-30 ms answers for most things without touching heavy models
- Full self-modification + autonomy = it can actually improve itself
- Real environment model + laptop observer = grounded decisions, not hallucinated context

This architecture is already far ahead of most "local AI agent" projects in 2026.

The only thing missing for the user's ultimate vision is the **pure neural substrate** described in `FUTURE_PURE_NEURAL_BRAIN_MODEL.md`.

---
This document was generated by exhaustive reading of the actual source code.
