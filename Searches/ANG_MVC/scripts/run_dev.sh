#!/usr/bin/env bash
# Start all services for local development (no Docker)
set -e
ROOT="$(dirname "$0")/.."

echo "=== ANG Dev Stack ==="

# 1. Rust ring buffer
echo "[1/4] Starting Rust ring buffer..."
cd "$ROOT/storage/rust_ringbuf"
cargo build --release -q
RINGBUF_PORT=8090 ./target/release/ang_ringbuf &
RINGBUF_PID=$!
cd "$ROOT"

# 2. Go store
echo "[2/4] Starting Go store..."
cd "$ROOT/storage/go_store"
go build -o ang_store . 2>/dev/null || echo "  (Go store build skipped — go not installed)"
[ -f ang_store ] && ./ang_store --grpc-port 50051 --data-dir /tmp/ang_store &
GO_PID=$!
cd "$ROOT"

# 3. Generate proto stubs
echo "[3/4] Generating gRPC stubs..."
bash "$ROOT/scripts/gen_proto.sh" 2>/dev/null || echo "  (proto gen skipped)"

# 4. FastAPI backend
echo "[4/4] Starting FastAPI backend..."
cd "$ROOT"
ANG_AUTO_TRAIN=0 \
ANG_LETTA_ENABLED=0 \
RINGBUF_URL=http://localhost:8090 \
GO_STORE_GRPC=localhost:50051 \
uvicorn app:app --host 0.0.0.0 --port 8081 --reload &
API_PID=$!

echo ""
echo "✓ Backend:    http://localhost:8081"
echo "✓ Ring buf:   http://localhost:8090"
echo "✓ Go store:   localhost:50051 (gRPC)"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $RINGBUF_PID $GO_PID $API_PID 2>/dev/null; exit" INT TERM
wait
