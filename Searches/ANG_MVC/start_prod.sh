#!/usr/bin/env bash
# =============================================================================
# ANG Production Launcher — starts all services with health checks
# Pure bare-metal, no Docker required.
# =============================================================================
set -euo pipefail

ANG_ROOT="$(cd "$(dirname "$0")" && pwd)"
export ANG_ROOT

LOG_DIR="$ANG_ROOT/logs"
mkdir -p "$LOG_DIR"

PIDFILE="$ANG_ROOT/.ang_pids"
cd "$ANG_ROOT"
VENV="$ANG_ROOT/.venv/bin"
export PATH="$VENV:$PATH"

export PYTHONUNBUFFERED=1
export RINGBUF_URL="${RINGBUF_URL:-http://localhost:8090}"
export GO_STORE_GRPC="${GO_STORE_GRPC:-localhost:50051}"
export ANG_KAFKA_WORKERS="0"
export ANG_AUTO_TRAIN="0"
export ANG_LETTA_ENABLED="0"
export ANG_LOG_LEVEL="${ANG_LOG_LEVEL:-INFO}"
export HF_HOME="$ANG_ROOT/.cache/huggingface"
export TRANSFORMERS_CACHE="$ANG_ROOT/.cache/huggingface"

RINGBUF_BIN="$ANG_ROOT/storage/rust_ringbuf/target/release/ang_ringbuf"
GO_BIN="$ANG_ROOT/storage/go_store/ang_store"
ANG_API_PORT="8081"
ANG_LEARN_PORT="8082"
ANG_FE_PORT="5173"

if ! command -v uvicorn &>/dev/null; then
  echo "ERROR: uvicorn not found. Activate venv first:"
  echo "  cd $ANG_ROOT && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

if [ ! -f "$RINGBUF_BIN" ]; then
  echo "Building Rust ring buffer..."
  cargo build --release --manifest-path "$ANG_ROOT/storage/rust_ringbuf/Cargo.toml" -q
fi

# Fix Go binary if just a script
if head -1 "$GO_BIN" | grep -q "^#!"; then
  echo "Rebuilding Go store..."
  (cd "$ANG_ROOT/storage/go_store" && \
    go build -o ang_store .)
fi

echo "========================================================================"
echo "  ANG Production Stack  —  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================================"
echo ""

# ── 1. Rust Ring Buffer (low-latency in-memory queue) ────────────────────────
echo "[1/5] Rust Ring Buffer  →  :8090"
pkill -f "ang_ringbuf" 2>/dev/null || true
RUST_LOG=warn "$RINGBUF_BIN" > "$LOG_DIR/ringbuf.log" 2>&1 &
disown $!
sleep 1
if curl -sf "$RINGBUF_URL/health" > /dev/null 2>&1; then
  echo "        ✓ Ring buffer running"
else
  echo "        ✗ Ring buffer failed — check $LOG_DIR/ringbuf.log"
fi

# ── 2. Go BadgerDB Store (persistent inference log) ───────────────────────────
echo "[2/5] Go BadgerDB Store  →  :50051"
pkill -f "ang_store" 2>/dev/null || true
"$GO_BIN" --grpc-port 50051 --data-dir "$ANG_ROOT/storage/go_store_data" > "$LOG_DIR/go_store.log" 2>&1 &
disown $!
sleep 1
if curl -sf "$RINGBUF_URL/health" > /dev/null 2>&1; then
  echo "        ✓ Go Store running"
else
  echo "        ✗ Go Store failed — check $LOG_DIR/go_store.log"
fi

# ── 3. FastAPI Backend (main inference engine) ─────────────────────────────────
echo "[3/5] FastAPI Backend  →  :$ANG_API_PORT"
pkill -f "uvicorn app:app" 2>/dev/null || true
ANG_MAIN_API="http://localhost:$ANG_API_PORT" \
ANG_SCRAPER_ENABLED="0" \
uvicorn app:app --host 0.0.0.0 --port "$ANG_API_PORT" --workers 1 > "$LOG_DIR/api.log" 2>&1 &
disown $!
sleep 3
if curl -sf "http://localhost:$ANG_API_PORT/api/health" > /dev/null 2>&1; then
  echo "        ✓ Main API running"
else
  echo "        ✗ Main API failed — check $LOG_DIR/api.log"
fi

# ── 4. Pro Learning Ecosystem ─────────────────────────────────────────────────
echo "[4/5] Pro Learning Ecosystem  →  :$ANG_LEARN_PORT"
pkill -f "learning_service.app:app" 2>/dev/null || true
ANG_LEARNING_PORT="$ANG_LEARN_PORT" \
ANG_MAIN_API="http://localhost:$ANG_API_PORT" \
uvicorn learning_service.app:app --host 0.0.0.0 --port "$ANG_LEARN_PORT" --workers 1 > "$LOG_DIR/learning.log" 2>&1 &
disown $!
sleep 2
if curl -sf "http://localhost:$ANG_LEARN_PORT/health" > /dev/null 2>&1; then
  echo "        ✓ Learning Ecosystem running"
else
  echo "        ✗ Learning Ecosystem failed — check $LOG_DIR/learning.log"
fi

# ── 5. Frontend (Vite / React — static production build) ──────────────────────
FE_DIR="$ANG_ROOT/anc_frontend"
FRONTEND_PID=""
if [ -d "$FE_DIR" ]; then
  echo "[5/5] Frontend  →  :$ANG_FE_PORT"
  pkill -f "vite" 2>/dev/null || true
  cd "$FE_DIR" && nohup npm run dev -- --port "$ANG_FE_PORT" --host > "$LOG_DIR/frontend.log" 2>&1 &
  cd "$ANG_ROOT"
  FRONTEND_PID=$!
  disown $FRONTEND_PID
  sleep 2
  if curl -sf "http://localhost:$ANG_FE_PORT" > /dev/null 2>&1; then
    echo "        ✓ Frontend running"
  else
    echo "        ℹ  Frontend not ready yet (may take a moment)"
  fi
else
  echo "[5/5] Frontend skipped (no anc_frontend directory)"
fi

echo ""
echo "========================================================================"
echo "  ANG is LIVE  —  all services started"
echo "========================================================================"
echo ""
echo "  🔵  Main Inference API   http://localhost:$ANG_API_PORT"
echo "     →  Health             http://localhost:$ANG_API_PORT/api/health"
echo "     →  Bridge (Chat/AI)   http://localhost:$ANG_API_PORT/api/bridge"
echo "     →  AGI Status         http://localhost:$ANG_API_PORT/admin/agi-status"
echo "     →  Cache Stats        http://localhost:$ANG_API_PORT/admin/cache-stats"
echo "     →  Pro AGI Chat       http://localhost:$ANG_API_PORT/api/pro/agi/chat"
echo "     →  Pro AGI Status     http://localhost:$ANG_API_PORT/api/pro/agi/status"
echo ""
echo "  🟢  Learning Ecosystem  http://localhost:$ANG_LEARN_PORT"
echo "     →  Health             http://localhost:$ANG_LEARN_PORT/health"
echo "     →  Laptop Observer     http://localhost:$ANG_LEARN_PORT/laptop/state"
echo ""
echo "  🟠  Storage (gRPC)      localhost:50051  (Go BadgerDB)"
echo "  🟡  Ring Buffer         localhost:8090  (Rust)"
echo ""
echo "  Logs:"
echo "    tail -f $LOG_DIR/api.log"
echo "    tail -f $LOG_DIR/learning.log"
echo "    tail -f $LOG_DIR/ringbuf.log"
echo "    tail -f $LOG_DIR/go_store.log"
echo ""
echo "  Stop all services:"
echo "    bash $ANG_ROOT/stop.sh"
echo "    OR  kill \$(cat $PIDFILE)"
echo "========================================================================"

# Save PIDs
pids=$(pgrep -f "ang_ringbuf\|ang_store\|uvicorn" | tr '\n' ' ')
echo "$pids" > "$PIDFILE"
