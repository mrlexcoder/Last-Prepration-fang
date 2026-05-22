"""
AuroraNeuroGrid MVC v2 — app entrypoint.

Full wiring:
  FastAPI lifespan → AppState → all layers share singletons
  Quantum Router (registry-cached) → Neurone Mesh (AGI-aware)
  InfinityCache → Multi-Structural Bridge → AGI layer
"""

import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from core.logger import setup_logging
setup_logging(os.getenv("ANG_LOG_LEVEL", "INFO"))

logger = logging.getLogger("ang.app")

from core.state import state
from core.quantum_router import reload_registry
from core.infinity_cache import InfinityCache
from core.multi_structural import MultiStructuralBridge
from core.agi import WorldModel, GoalEngine, MetaCognition
from core.neurone_mesh import run_neurone_mesh

from controllers.infer_controller import infer_router
from controllers.health_controller import health_router
from controllers.loop_controller import loop_router
from controllers.admin_controller import admin_router, register_agi
from controllers.bridge_controller import bridge_router, register_bridge


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────
    logger.info("ANG startup: loading registry")
    reload_registry()

    logger.info("ANG startup: initialising InfinityCache")
    cache_dir = os.getenv("ANG_CACHE_DIR", "/tmp/ang_infinity_cache")
    cache = InfinityCache(cache_dir=cache_dir)

    logger.info("ANG startup: initialising AGI layer")
    world_model = WorldModel()
    goal_engine = GoalEngine()
    meta_cognition = MetaCognition()

    # Seed root goals
    goal_engine.decompose(
        root_description="Serve accurate, low-latency AI inference",
        subgoal_descriptions=[
            "Route requests to optimal runtime adapter",
            "Maintain and query vector memory for context",
            "Run automation loops with confidence evaluation",
            "Reflect on outcomes and update self-model",
        ],
    )

    # Bridge wraps neurone mesh — reads runtime_hint from payload if provided
    async def _infer_fn(prompt: str, runtime_hint: str | None = None) -> dict:
        from core.quantum_router import select_runtime
        runtime = select_runtime(runtime_hint=runtime_hint)
        return await run_neurone_mesh(runtime, prompt, mode="bridge")

    bridge = MultiStructuralBridge(infer_fn=_infer_fn, cache=cache)

    # Push everything into shared AppState
    register_agi(world_model=world_model, goal_engine=goal_engine,
                 meta_cognition=meta_cognition, cache=cache)
    register_bridge(bridge)

    logger.info("ANG startup complete")
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────
    logger.info("ANG shutdown")


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="AuroraNeuroGrid MVC",
    description="Brain-Scale AI Fabric — quantum-informed routing · neurone mesh · infinite-memory caching.",
    version="2.0.0",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


app.include_router(infer_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(loop_router, prefix="/api")
app.include_router(bridge_router, prefix="/api")
app.include_router(admin_router)
