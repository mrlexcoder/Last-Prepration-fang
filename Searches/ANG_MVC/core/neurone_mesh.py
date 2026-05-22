import importlib
from pathlib import Path
import json

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "connectors" / "registry.json"


def load_adapter_module(adapter_id: str):
    registry = json.loads(REGISTRY_PATH.read_text())
    adapter = next((item for item in registry.get("adapters", []) if item["id"] == adapter_id), None)
    if not adapter:
        adapter_id = "runtime_adapter_stub"
        adapter = next((item for item in registry.get("adapters", []) if item["id"] == adapter_id), None)

    module_name, function_name = adapter["entrypoint"].split(":")
    module = importlib.import_module(module_name)
    return getattr(module, function_name)


async def run_neurone_mesh(runtime_id: str, prompt: str) -> dict:
    infer_fn = load_adapter_module(runtime_id)
    return await infer_fn(prompt)
