# How AuroraNeuroGrid Actually Works — Mechanics (May 2026)

This document explains the **real runtime behavior**, not just the boxes on the diagram.

## 1. Cold Start vs Warm Start (The Most Important Distinction)

**Cold path (first request ever for an adapter):**
- Registry is loaded (or hot-reloaded via `/admin/refresh-connectors`)
- Quantum router scores every adapter
- WarmAdapterPool acquires per-adapter lock
- Dynamic import of the adapter module + entrypoint
- Model weights are loaded into memory (this is the expensive part)
- Infer function is stored forever in the pool

**Warm path (every subsequent request):**
- `adapter_pool.get(id)` returns the already-loaded async function in < 1–5 ms
- No Python import, no model loading, no disk I/O for weights
- This is why the system can feel "instant" after the first use of each brain

## 2. The Quantum Router Decision Process

Every single inference goes through `select_runtime()`:

1. Explicit `runtime_hint` in the request? → use it immediately.
2. Otherwise: score every adapter using:
   - reported_latency_ms
   - cpu/gpu/memory hints
   - Hard penalty if it exceeds the caller's latency budget
   - **v3 Pro rule**: massive bonus (-1500) if the adapter declares "instruction" or "chat" capability; heavy penalty (+1200) for pure stubs when real models exist.

Result: the system almost always prefers a real capable model unless you explicitly ask for the fastest stub.

## 3. CMU Router — When Do We Actually Run Many Calculations?

This is the "multiple neural calculations at the same time" mechanism that already exists.

The router scores query complexity (length, uncertainty words, multi-hop signals, novelty vs cache, etc.).

- Trivial or cached → CMU-0 or CMU-1 (1 calculation or 0)
- Medium reasoning → CMU-2 (usually 2 calculations: generator + critic)
- Hard/novel/high-stakes → CMU-3 (4–5 agents in parallel via MultiAgentEnsemble + synthesis)
- "I want god-mode thinking" or autonomous mode → CMU-4 (full 10+ step AGI loop: curiosity, world model counterfactuals, Reflexion, AgentScope agents, goal decomposition, etc.)

The beauty is that **this decision is made per query at runtime** using the same neural models. It is not a static architecture choice.

## 4. The Fast Physics Brain (<30 ms Path)

For most everyday questions the system never even touches the heavy LLM adapters.

`UltraFastDecisionEngine.decide_and_answer()`:
1. Semantic + exact cache check (Tier 0)
2. Extract features → feed to QuantumPhysicsEngine
3. Predict future state (recursive)
4. Compute action value
5. Simulate what the next likely question will be and pre-compute the answer in background
6. Synthesize answer using physics + any vision state
7. Continuous micro-learning: if this path was slow, it adjusts internal weights
8. If still too slow or low confidence → fire an async self-correction task

This is the "small fast brain" that runs all the time in the background.

## 5. The Full AGI Loop (What Happens in Autonomous Mode)

When `ProAGIMaster.start_autonomous_mode()` runs (and it starts automatically on boot):

Every ~2 seconds:
1. Get full world state (vision + laptop observer + any other sensors)
2. Run quantum physics action-value calculation on current state
3. If decision says "execute", call `think_and_act(autonomous=True)`
4. Inside think_and_act it can:
   - Use any of the 30+ god-mode tools
   - Call the bridge in full "agi" mode
   - Trigger training, code editing, git operations, etc.
5. Run aggressive `self_improve()`:
   - Analyze performance
   - If high latency detected → automatically train faster adapter or edit `fast_decision_engine.py` to lower target from 30 ms to 18 ms
   - Randomly trigger science concept harvesting + full program generation
6. Watch laptop activity in real time and feed it into WorldModel as observations

This loop can (and does) modify the running system while it is running.

## 6. Learning & Self-Generation Mechanics

Three overlapping continuous systems:

- **AutoLearner**: 3-track learning (fast weights, slow consolidation, meta-strategy). Runs in background forever.
- **AutoBuilder**: Watches the learner and autonomously writes new code / improves modules.
- **ScraperGrid**: 24/7 scrapes arXiv, Wikipedia, biology sites, neural papers, etc. Extracts concepts → feeds them to the generation engine so the system can literally "learn new science and write new brains" without human input.

High-quality interactions are turned into training signals automatically.

## 7. Memory & Persistence

- InfinityCache: FAISS vector store with smart eviction (TTL + access count + size cap). Used as long-term "what have we done before" memory.
- Mem0: another persistent memory layer (personality, facts, user preferences).
- Letta: long-term agent state that survives restarts.
- Rust ringbuf + Go store: for hot paths and structured high-speed access.
- WorldModel + MetaCognition + GoalEngine: the actual "mind" that survives across requests.

## 8. Safety & Control Mechanisms (Already Present)

- Max iterations on loops
- Confidence thresholds before autonomous action
- Explicit human-in-the-loop toggles for destructive tools
- Per-adapter resource hints so the router can avoid OOM
- Device manager that caps VRAM usage

The system is already designed to be powerful **but not suicidal**.

---

This document describes the actual executable mechanics that exist in the code today.

The user's desired "pure neural 100,000,000-neuron small-person-brain that encrypts the entire system state and runs with almost zero CPU while still being able to write its own code with god-like decisions" is the **next layer** on top of this already extremely advanced hybrid architecture.

The current mechanics give us an excellent testbed and scaffolding to build that future pure neural brain.
