from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from controllers.infer_controller import infer_router
from controllers.health_controller import health_router
from controllers.loop_controller import loop_router

app = FastAPI(title="AuroraNeuroGrid MVC")

BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

templates = Jinja2Templates(directory=BASE_DIR / "templates")

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.include_router(infer_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(loop_router, prefix="/api")
