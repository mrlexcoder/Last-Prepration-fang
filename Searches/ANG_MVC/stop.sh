#!/usr/bin/env bash
# =============================================================================
# ANG Stop — gracefully stops all services started by start_prod.sh
# =============================================================================
set -euo pipefail

ANG_ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDFILE="$ANG_ROOT/.ang_pids"
LOG_DIR="$ANG_ROOT/logs"

echo "Stopping ANG services..."

# Kill from PID file first
if [ -f "$PIDFILE" ]; then
  while read pid; do
    [ -z "$pid" ] && continue
    kill "$pid" 2>/dev/null && echo "  ✓ killed PID $pid" || true
  done < "$PIDFILE"
  rm -f "$PIDFILE"
fi

# Fallback: kill by name pattern
pkill -f "ang_ringbuf"     2>/dev/null && echo "  ✓ ringbuf stopped"   || true
pkill -f "ang_store"        2>/dev/null && echo "  ✓ go_store stopped"  || true
pkill -f "uvicorn app:app"  2>/dev/null && echo "  ✓ api stopped"       || true
pkill -f "learning_service" 2>/dev/null && echo "  ✓ learning stopped"  || true
pkill -f "vite"             2>/dev/null && echo "  ✓ frontend stopped"  || true

sleep 2

# Verify
remaining=$(pgrep -f "ang_ringbuf|ang_store|uvicorn" 2>/dev/null | wc -l)
if [ "$remaining" -eq "0" ]; then
  echo ""
  echo "✓ All ANG services stopped."
else
  echo ""
  echo "⚠  Some processes still running, force-killing..."
  pkill -9 -f "ang_ringbuf|ang_store|uvicorn" 2>/dev/null || true
  sleep 1
  echo "✓ Force-killed."
fi
