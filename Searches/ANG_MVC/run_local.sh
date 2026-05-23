#!/usr/bin/env bash
# ANG Local Dev Launcher
# Starts: Rust ring buffer, Go store, FastAPI backend, Vite frontend
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "╔══════════════════════════════════════╗"
echo "║   ANG Local Dev Stack                ║"
echo "╚══════════════════════════════════════╝"

# ── Kill any previous instances ──────────────────────────────────────────────
fuser -k 8090/tcp 2>/dev/null || true
fuser -k 50051/tcp 2>/dev/null || true
fuser -k 8081/tcp 2>/dev/null || true

# ── 1. Rust Ring Buffer ───────────────────────────────────────────────────────
echo "[1/4] Starting Rust ring buffer on :8090..."
RINGBUF_BIN="$ROOT/storage/rust_ringbuf/target/release/ang_ringbuf"
if [ ! -f "$RINGBUF_BIN" ]; then
  echo "  Building Rust ring buffer..."
  cargo build --release --manifest-path "$ROOT/storage/rust_ringbuf/Cargo.toml" -q
fi
RINGBUF_PORT=8090 "$RINGBUF_BIN" &
RINGBUF_PID=$!

# ── 2. Go BadgerDB Store ──────────────────────────────────────────────────────
echo "[2/4] Starting Go store on :50051..."
GO_BIN="$ROOT/storage/go_store/ang_store"
if [ ! -f "$GO_BIN" ]; then
  echo "  Building Go store..."
  (cd "$ROOT/storage/go_store" && \
    export PATH="$PATH:$(go env GOPATH)/bin" && \
    protoc --go_out=. --go_opt=paths=source_relative \
           --go-grpc_out=. --go-grpc_opt=paths=source_relative \
           proto/ang_store.proto 2>/dev/null || true && \
    go build -o ang_store .)
fi
"$GO_BIN" --grpc-port 50051 --data-dir /tmp/ang_store_data &
GO_PID=$!

# ── 3. FastAPI Backend ────────────────────────────────────────────────────────
echo "[3/4] Starting FastAPI backend on :8081..."
VENV="$ROOT/.venv/bin"
if [ ! -f "$VENV/uvicorn" ]; then
  echo "  ERROR: venv not set up. Run: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

ANG_KAFKA_WORKERS=0 \
ANG_AUTO_TRAIN=0 \
ANG_LETTA_ENABLED=0 \
RINGBUF_URL=http://localhost:8090 \
GO_STORE_GRPC=localhost:50051 \
"$VENV/uvicorn" app:app --host 0.0.0.0 --port 8081 --reload &
API_PID=$!

# ── 4. Vite Frontend ──────────────────────────────────────────────────────────
echo "[4/4] Starting frontend on :5173..."
(cd "$ROOT/anc_frontend" && npm run dev -- --port 5173) &
FRONT_PID=$!

sleep 3
echo ""
echo "✓ Ring buffer:  http://localhost:8090/health"
echo "✓ Go store:     localhost:50051 (gRPC)"
echo "✓ Backend API:  http://localhost:8081/api/health"
echo "✓ Frontend:     http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

cleanup() {
  echo "Stopping..."
  kill $RINGBUF_PID $GO_PID $API_PID $FRONT_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM
wait
