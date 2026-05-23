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
from core.adapter_pool import WarmAdapterPool   # v3 P0 — Warm Adapter Pool

from controllers.infer_controller import infer_router
from controllers.health_controller import health_router
from controllers.loop_controller import loop_router
from controllers.admin_controller import admin_router, register_agi
from controllers.bridge_controller import bridge_router, register_bridge


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────
    logger.info("ANG startup: loading registry")
    registry = reload_registry()

    # ── v3 P0: Warm Adapter Pool (critical for <5ms adapter access) ───────
    logger.info("ANG startup: initialising WarmAdapterPool (v3)")
    adapter_pool = WarmAdapterPool(registry=registry)
    # Preload adapters that have "preload": true in registry (or all if none marked)
    await adapter_pool.preload_all()
    state.adapter_pool = adapter_pool

    # ── Storage layer (Go + Rust) ─────────────────────────────────────────
    logger.info("ANG startup: initialising storage clients")
    from core.storage_client import get_storage
    storage = get_storage()
    storage.ring.ping()  # non-blocking probe
    state.storage = storage

    # ── Mem0 memory layer ─────────────────────────────────────────────────
    logger.info("ANG startup: initialising Mem0 layer")
    from core.mem0_layer import get_mem0
    state.mem0 = get_mem0()

    logger.info("ANG startup: initialising InfinityCache")
    cache_dir = os.getenv("ANG_CACHE_DIR", "/tmp/ang_infinity_cache")
    cache = InfinityCache(cache_dir=cache_dir)

    logger.info("ANG startup: initialising AGI layer")
    world_model = WorldModel()
    goal_engine = GoalEngine()
    meta_cognition = MetaCognition()

    # v3 Pro: CMU Router (multiple calculation intelligence)
    from core.cmu_router import CognitiveMotorRouter
    cmu_router = CognitiveMotorRouter(cache=cache, meta=meta_cognition, world_model=world_model)
    state.cmu_router = cmu_router

    # Seed root goals
    goal_engine.decompose(
        root_description="Serve accurate, low-latency AI inference",
        subgoal_descriptions=[
            "Route requests to optimal runtime adapter",
            "Maintain and query vector memory for context",
            "Run automation loops with confidence evaluation",
            "Reflect on outcomes and update self-model",
            "Continuously fine-tune on high-quality interactions",
            "Run multi-agent ensemble for best answers",
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
                  meta_cognition=meta_cognition, cache=cache, cmu_router=cmu_router)
    register_bridge(bridge)

    # ── Kafka workers (embed + train signal) ─────────────────────────────────
    if os.getenv("ANG_KAFKA_WORKERS", "0") == "1":
        logger.info("ANG startup: launching Kafka background workers")
        from web_intel.workers import start_workers
        from web_intel.kafka_bus import get_producer
        producer = get_producer()
        await producer.start()
        state.kafka_producer = producer
        start_workers()

    # ── Auto-trainer daemon (24/7 Unsloth fine-tuning) ────────────────────
    if os.getenv("ANG_AUTO_TRAIN", "0") == "1":
        logger.info("ANG startup: launching auto-trainer daemon")
        from training.auto_trainer import start_training_daemon
        start_training_daemon()

    # ── Letta agent manager ───────────────────────────────────────────────
    if os.getenv("ANG_LETTA_ENABLED", "0") == "1":
        logger.info("ANG startup: initialising Letta agents")
        from core.letta_agent import get_letta
        state.letta = get_letta()

    logger.info("ANG startup complete ✓")
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────
    logger.info("ANG shutdown")
    if hasattr(state, "kafka_producer") and state.kafka_producer:
        await state.kafka_producer.stop()


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="AuroraNeuroGrid MVC",
    description="Brain-Scale AI Fabric — quantum-informed routing · neurone mesh · infinite-memory caching.",
    version="2.0.0",
    lifespan=lifespan,
)

# Frontend is served separately via Vite dev server on port 5173
# app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
# templates = Jinja2Templates(directory=BASE_DIR / "templates")


# @app.get("/")
# async def home(request: Request):
#     return templates.TemplateResponse("index.html", {"request": request})


app.include_router(infer_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(loop_router, prefix="/api")
app.include_router(bridge_router, prefix="/api")
app.include_router(admin_router)
