# AuroraNeuroGrid MVC App

This folder contains a pro-level MVC scaffold for the AuroraNeuroGrid execution layer. It is designed for fast decision-making, clean separation of layers, and a lightweight frontend.

Structure:
- `app.py` — FastAPI application entrypoint
- `controllers/` — request handling and routing
- `services/` — business logic and execution flow
- `core/` — runtime selection and orchestration helpers
- `models/` — request/response contracts
- `adapters/` — runtime adapters and model runtime stubs
- `connectors/` — connector registry metadata
- `templates/` — lightweight HTML frontend
- `static/` — CSS and JavaScript assets

Run locally:

```bash
cd Searches/ANG_MVC
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8081
```

Then open `http://localhost:8081`.
