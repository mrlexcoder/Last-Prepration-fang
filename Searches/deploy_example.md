# AuroraNeuroGrid — Single-Host Deploy Example

This example shows minimal steps to run a single-host demo using local open-source components.

Prerequisites
- Linux host with Python 3.10+ and git
- Optional: CUDA GPU for Hugging Face acceleration

Quick start (venv)

```bash
cd /opt/lampp/htdocs/myprepProjects/Last-Prepration-fang/Searches
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn gradio langchain chromadb faiss-cpu
# create a minimal app file (see neurone-mesh skeleton)
uvicorn app:app --host 0.0.0.0 --port 8080
```

LLM runtime notes
- `llama.cpp`: clone and build locally, then point `runtime-adapter-llama` to the binary for IPC.
- `transformers`: install `transformers` and `accelerate` to run GPU/FP16 models.

Adding a connector (example)
1. Create `connectors/llama/manifest.json` with metadata:
```json
{
  "name":"llama.cpp",
  "repo_url":"https://github.com/ggerganov/llama.cpp",
  "entrypoint":"runtime-adapter-llama:main",
  "capabilities":["chat","completion","embeddings"],
  "resourceHints":{"cpu":4,"mem_gb":8}
}
```
2. POST `/admin/refresh-connectors` to load it into `neurone-mesh`.

Safety
- Set `max_loop_iterations=5` in `automation-loop-engine` config.
- Enable prompt evaluation and human-in-the-loop toggles for destructive actions.

Next: I will commit these new files and push them to the repo. 