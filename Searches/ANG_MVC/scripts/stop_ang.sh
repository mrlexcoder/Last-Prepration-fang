#!/bin/bash
# AuroraNeuroGrid Shutdown Script
# Gracefully shuts down all AGI components and preserves state

PROJECT_ROOT="/opt/lampp/htdocs/myprepProjects/Last-Prepration-fang/Searches/ANG_MVC"
LOG_DIR="$PROJECT_ROOT/logs"
STATE_FILE="/tmp/ang_autostart_state.json"

echo "========================================"
echo "AURORANEUROGRID SHUTDOWN"
echo "========================================"
echo "Timestamp: $(date)"

cd "$PROJECT_ROOT"

# Send SIGTERM for graceful shutdown
if [ -f /tmp/ang_master.pid ]; then
    PID=$(cat /tmp/ang_master.pid)
    echo "[Shutdown] Sending SIGTERM to ANG server (PID: $PID)..."
    kill -TERM "$PID" 2>/dev/null || true
fi

# Kill auto-learner
echo "[Shutdown] Stopping auto-learner processes..."
pkill -f "auto_learner.py" 2>/dev/null || true

# Wait for graceful shutdown
sleep 3

# Force kill if still running
if [ -f /tmp/ang_master.pid ]; then
    PID=$(cat /tmp/ang_master.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "[Shutdown] Force killing remaining processes..."
        kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f /tmp/ang_master.pid
fi

# Save final state
echo "[Shutdown] Saving final state..."
python3 -c "
import json, time
from pathlib import Path
state = json.load(open('$STATE_FILE')) if Path('$STATE_FILE').exists() else {}
state['shutdown_time'] = time.time()
state['last_uptime'] = state.get('last_boot', time.time())
json.dump(state, open('$STATE_FILE', 'w'), indent=2)
"

# Clean up any remaining uvicorn processes
pkill -f "uvicorn app:app" 2>/dev/null || true

echo "[Shutdown] ANG System stopped gracefully"
echo "========================================"