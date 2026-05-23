#!/usr/bin/env python3
"""
ANG Starter - One command to rule them all.

Usage:
    python scripts/start.py
    # or after chmod +x
    ./scripts/start.py

This script starts:
  - Backend (FastAPI + Uvicorn) on http://localhost:8081
  - Frontend (Vite) on http://localhost:5173

Both run in background with clean logging.
Ctrl+C gracefully shuts everything down.
"""

import os
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT
FRONTEND_DIR = ROOT / "anc_frontend"

BACKEND_CMD = [
    sys.executable, "-m", "uvicorn",
    "app:app",
    "--host", "0.0.0.0",
    "--port", "8081",
    "--reload"
]

FRONTEND_CMD = ["npm", "run", "dev"]

processes = []


def log(msg, color="36"):
    print(f"\033[{color}m[ANG] {msg}\033[0m")


def cleanup(sig=None, frame=None):
    log("Shutting down all services...", "31")
    for p in processes:
        try:
            p.terminate()
        except Exception:
            pass
    time.sleep(1)
    for p in processes:
        try:
            p.kill()
        except Exception:
            pass
    log("All services stopped. Goodbye!", "32")
    sys.exit(0)


def start_service(name, cmd, cwd):
    log(f"Starting {name}...")
    env = os.environ.copy()
    if name == "Frontend":
        env["BROWSER"] = "none"  # prevent auto browser open

    p = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(p)

    # Simple log tailer
    def tail():
        for line in p.stdout:
            prefix = "BE" if name == "Backend" else "FE"
            print(f"[{prefix}] {line.strip()}")

    import threading
    threading.Thread(target=tail, daemon=True).start()
    return p


def main():
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    log("=== AuroraNeuroGrid (ANG) Full System Starter ===")
    log(f"Project root: {ROOT}")

    # Start Backend
    backend = start_service("Backend", BACKEND_CMD, BACKEND_DIR)

    # Give backend a head start
    time.sleep(3)

    # Start Frontend
    frontend = start_service("Frontend", FRONTEND_CMD, FRONTEND_DIR)

    log("Both services are starting...")
    log("Backend  →  http://localhost:8081")
    log("Frontend →  http://localhost:5173")
    log("Press Ctrl+C to stop everything.")

    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()


if __name__ == "__main__":
    main()
