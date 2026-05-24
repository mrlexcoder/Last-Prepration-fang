#!/usr/bin/env bash
# =============================================================================
# ANG bare-metal setup — venv + psutil + compiled binaries
# =============================================================================
set -euo pipefail

ANG_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ANG_ROOT"

echo "╔══════════════════════════════════════╗"
echo "║  ANG bare-metal setup                ║"
echo "╚══════════════════════════════════════╝"

echo "[1/5] Installing build dependencies..."
sudo apt-get update -qq 2>/dev/null
sudo apt-get install -y -qq build-essential python3-dev python3-venv \
  pkg-config libssl-dev protobuf-compiler libprotobuf-dev \
  libsensors5 lm-sensors 2>/dev/null || true

echo "[2/5] Python venv + dependencies..."
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
pip install psutil -q
echo "       ✓ Python environment ready"

echo "[3/5] Rust Ring Buffer"
cargo build --release --manifest-path storage/rust_ringbuf/Cargo.toml -q
echo "       ✓ $(storage/rust_ringbuf/target/release/ang_ringbuf --version 2>&1 || echo 'built')"

echo "[4/5] Go BadgerDB Store"
if head -1 storage/go_store/ang_store | grep -q "^#!"; then
  (cd storage/go_store && go build -o ang_store .)
  echo "       ✓ rebuilt"
else
  echo "       ✓ binary already built"
fi

echo "[5/5] Directories"
mkdir -p logs /tmp/ang_infinity_cache /tmp/ang_store_data
chmod +x start_prod.sh stop.sh scripts/ang_watchdog.sh
echo "       ✓ logs & tmp dirs ready"

echo ""
echo "✓ Setup complete. Run:")
echo "   bash start_prod.sh"
echo ""
