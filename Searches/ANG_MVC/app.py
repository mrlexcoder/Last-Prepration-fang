"""
AuroraNeuroGrid MVC — app entrypoint.

Wires together:
  - FastAPI ingress
  - Quantum Router + Neurone Mesh
  - InfinityCache (vector memory)
  - Multi-Structural Bridge (chat/search/tools/pipeline)
  - AGI layer (WorldModel, GoalEngine, MetaCognition)
  - All routers
"""

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from core.logger import setup_logging
setup_logging(os.getenv("ANG_LOG_LEVEL", "INFO"))

from controllers.infer_controller import infer_router
from controllers.health_controller import health_router
from controllers.loop_controller import loop_router
from controllers.admin_controller import admin_router, register_agi
from controllers.bridge_controller import bridge_router, register_bridge

from core.infinity_cache import InfinityCache
from core.multi_structural import MultiStructuralBridge
from core.agi import WorldModel, GoalEngine, MetaCognition
from core.neurone_mesh import run_neurone_mesh

app = FastAPI(
    title="AuroraNeuroGrid MVC",
    description="Brain-Scale AI Fabric — quantum-informed routing, neurone mesh orchestration, infinite-memory caching.",
    version="2.0.0",
)

BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.on_event("startup")
async def startup():
    # InfinityCache
    cache_dir = os.getenv("ANG_CACHE_DIR", "/tmp/ang_infinity_cache")
    cache = InfinityCache(cache_dir=cache_dir)

    # AGI layer
    world_model = WorldModel()
    goal_engine = GoalEngine()
    meta_cognition = MetaCognition()

    # Multi-Structural Bridge — wraps neurone mesh infer function
    async def _infer_fn(prompt: str) -> dict:
        from core.quantum_router import select_runtime
        runtime = select_runtime()
        return await run_neurone_mesh(runtime, prompt)

    bridge = MultiStructuralBridge(infer_fn=_infer_fn, cache=cache)

    # Register with controllers
    register_agi(world_model=world_model, goal_engine=goal_engine,
                 meta_cognition=meta_cognition, cache=cache)
    register_bridge(bridge)

    # Seed a root goal on startup
    goal_engine.decompose(
        root_description="Serve accurate, low-latency AI inference",
        subgoal_descriptions=[
            "Route requests to optimal runtime adapter",
            "Maintain and query vector memory for context",
            "Run automation loops with confidence evaluation",
        ],
    )


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# Routers
app.include_router(infer_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(loop_router, prefix="/api")
app.include_router(bridge_router, prefix="/api")
app.include_router(admin_router)
