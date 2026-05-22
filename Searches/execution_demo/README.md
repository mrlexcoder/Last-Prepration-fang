AuroraNeuroGrid — Execution Layer Demo

This minimal demo shows a runnable single-host scaffold for fast decision-making and execution.

Files:
- `app.py` — FastAPI app with `/infer` and admin endpoints
- `quantum_router.py` — lightweight, fast runtime selector
- `neurone_mesh.py` — small orchestrator that executes 1-step loops
- `runtime_adapters/runtime_adapter_stub.py` — example runtime adapter stub
- `connectors/registry.json` — connector registry used by the router
- `run_local.sh` — quick commands to run the demo

Purpose:
- Demonstrate low-latency selection and execution (no heavy ML models included)
- Provide scaffolding to add real runtime adapters (Qwen, RWKV, llama.cpp)

Run locally (recommended inside venv):

```bash
cd Searches/execution_demo
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8080
```

Endpoints:
- `GET /health` — health check
- `POST /infer` — body: {"input":"...","latency_budget_ms":200}
- `POST /admin/refresh-connectors` — reload connectors registry
