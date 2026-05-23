# AuroraNeuroGrid (ANG) — Quick Start & Professional Operations Guide

## 1. One-Command Professional Launch (Recommended 2026)

### Terminal 1 — Backend (with live reload)
```bash
cd /opt/lampp/htdocs/myprepProjects/Last-Prepration-fang/Searches/ANG_MVC
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8081 --reload
```

### Terminal 2 — Frontend (Development)
```bash
cd anc_frontend
npm run dev
# Open http://localhost:5173
```

### Production Frontend (after build)
```bash
cd anc_frontend
npm run build
npx serve dist -l 5174
```

---

## 2. Verify Everything Is Working (Pro Checklist)

1. Backend healthy: `curl http://localhost:8081/api/health`
2. Registry loaded: `curl http://localhost:8081/admin/status`
3. Chat works in UI at `http://localhost:5173/app`
4. Notebook works: create notebook → add sources → chat inside it
5. Admin dashboard: `http://localhost:5173/admin` (login with `tekkivo@gmail.com / tekkivo@gmail.com`)

---

## 3. Environment Variables (Pro Control Knobs)

```bash
export ANG_HF_MODEL="Qwen/Qwen2.5-0.5B-Instruct"   # or any HF model
export ANG_FORCE_CPU=1                              # force CPU even if GPU present
export ANG_AUTO_TRAIN=1                             # enable 24/7 self-improvement
export ANG_KAFKA_WORKERS=1                          # real-time web intel
export ANG_LETTA_ENABLED=1                          # persistent agents
export ANG_LOG_LEVEL=DEBUG
```

---

## 4. Hot-Reload New Brains (Live Production)

1. Edit `connectors/registry.json`
2. Add new adapter entry with correct `entrypoint`
3. Call:
   ```bash
   curl -X POST http://localhost:8081/admin/refresh-connectors
   ```
4. New brain is instantly available to Quantum Router.

---

## 5. Pro Usage Patterns

### Force a Specific Brain
Frontend / API: send `runtime_hint: "qwen-2.5-4b-instruct"`

### Deep Iterative Thinking (Loop Mode)
Use the Loop mode in chat or call `/api/loop` directly — the system will self-critique until high confidence.

### Research with Full Provenance
Use **Notebook** (Sources + Chat + Studio). Every source is grounded and traceable.

### Long-term Memory Across Sessions
Mem0 + Letta + Storage layers automatically remember users.

---

## 6. Monitoring (Pro Operations)

- Admin page shows live:
  - Backend health
  - Active adapters + latency
  - InfinityCache stats (FAISS)
  - AGI GoalEngine + MetaCognition snapshots
- Logs: `backend.log` + browser console
- Full traces available via structured logs (`logger` in every layer)

---

## 7. Common Pro Commands

```bash
# Restart everything cleanly
pkill -f uvicorn; pkill -f vite; sleep 2
# then relaunch as above

# Rebuild frontend only
cd anc_frontend && npm run build

# Check which model is actually loaded
curl -s http://localhost:8081/api/health | jq
```

---

## 8. Where to Find Everything (Quick Map)

- Architecture & Deep Thinking → `docs/ANG_PROFESSIONAL_FULL_ARCHITECTURE.md`
- Main entry → `app.py`
- Decision brain → `core/quantum_router.py`
- Execution + cognition → `core/neurone_mesh.py`
- All intelligence modes → `core/multi_structural/bridge.py`
- Real Qwen brain → `adapters/runtime_adapter_hf.py`
- Frontend source → `anc_frontend/src/`

---

**You now have a complete professional AGI system + full documentation.**

Run it. Use it. Extend it. It will get smarter every day.
