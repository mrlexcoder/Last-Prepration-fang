# Neural Brain Track — Internal Roadmap & Current Status (Started 2026-05-24)

This is the dedicated track for building the **pure neural, low-power, "small person brain"** that will eventually encrypt the entire ANG system and replace most hybrid LLM+Python thinking.

## Guiding Vision
- One (or small family of) neural manifold(s) that contain a compressed, predictive, causal model of:
  - The running ANG system itself (code, state, goals, self-model)
  - The physical + digital environment (via LaptopObserver + Vision + browser)
  - Future outcomes and "what if" rollouts
- Runs 50M–200M effective neural operations when needed, but with extreme sparsity so average power stays 3–12W.
- Strong autonomous decision making and code writing emerge directly from the neural dynamics.
- The current ANG_MVC + ProAGIMaster + CMU + AutoLearner continue running as the **data generation + autonomy engine** and safety layer while we build the real brain underneath.

## Phased Plan (Prioritized)

### Phase 0 — Foundation (Now – June 2026)
- [x] Directory structure created (`core/neural_brain/`)
- [ ] NeuralWorldModel core class (the "encrypted system state" container)
- [ ] TinyNeuralBrain (fast always-on <25ms low-power neural path)
- [ ] Minimal training + inference scaffolds (start with efficient small models)
- [ ] Integration hooks so existing ProAGIMaster / fast_decision_engine / CMU can start feeding real data and calling the new brain
- [ ] First version of self-supervised data pipeline from autonomy loop + laptop observer

### Phase 1 — Tiny Always-On Brain (June – Aug 2026)
- Replace the current Python QuantumPhysicsEngine + fast_decision_engine hot path with a real trained tiny neural network (200–500M params, heavily quantized or distilled).
- Runs continuously on CPU/NPU with <5W.
- Handles 80%+ of decisions without touching any external LLM.
- Starts emitting its own intrinsic curiosity / prediction error signals.

### Phase 2 — Neural World Model v0.1 (Aug – Nov 2026)
- Build the first version of the NeuralWorldModel that can:
  - Ingest full system + environment snapshots
  - Maintain compressed latent state of "what the entire ANG + user world looks like right now"
  - Run lightweight forward simulations and counterfactuals inside the latent space
- Hybrid at first (neural latents + some symbolic scaffolding for safety/interpretability)
- Begin continuous online training from high-quality autonomy traces

### Phase 3 — Sparse Parallel Cortical Mesh (late 2026 – mid 2027)
- Move from "simulate multiple calculations with Python + LLM calls" to real sparse parallel neural execution.
- Extreme MoE or modern equivalent with thousands of tiny experts, only 1–5% active.
- CMU-3 / CMU-4 level thinking starts happening as natural parallel dynamics inside the cortical layer.
- First neural code synthesis experiments (model proposes real architectural changes that are then applied via existing god-mode tools after simulation safety checks).

### Phase 4 — Full Low-Power Brain + Strong Decision Maker (2027+)
- Hierarchical continuous-time neural architecture (Neural ODEs / Liquid / State-Space / future equivalents).
- Always-on brainstem + sparsely activated deep cortex.
- The Pro AGI and "strong decision maker that writes its own code" become emergent properties of the neural dynamics rather than separate Python objects.
- Native support for neuromorphic or near-neuromorphic hardware for the always-on parts (milliwatt range).

## Current Status (as of 2026-05-24 20:40)

- Neural brain package directory created.
- This roadmap written.
- First core components being implemented right now.

This track runs in parallel with the existing ANG_MVC system. The existing god-mode autonomy and learning loops will be the primary source of training data and real-world grounding for the new neural brain.

Next immediate actions are listed in the main files being created in this session.
