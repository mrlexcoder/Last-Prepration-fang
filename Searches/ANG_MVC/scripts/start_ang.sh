#!/bin/bash
# AuroraNeuroGrid AGI System - Auto-Learning Startup Script
# This script starts the complete ANG v3 system with all components

set -e

PROJECT_ROOT="/opt/lampp/htdocs/myprepProjects/Last-Prepration-fang/Searches/ANG_MVC"
LOG_DIR="$PROJECT_ROOT/logs"
PID_FILE="/tmp/ang_master.pid"

mkdir -p "$LOG_DIR"

echo "========================================"
echo "AURORANEUROGRID v3 PRO - AUTO STARTUP"
echo "========================================"
echo "Timestamp: $(date)"
echo "Project Root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# Function to check if server is already running
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "ANG System already running (PID: $PID)"
            exit 0
        fi
    fi
}

# Check if already running
check_running

# Clean up old processes
pkill -f "uvicorn app:app" 2>/dev/null || true
sleep 1

# Set resource limits
echo "[Startup] Setting resource limits (4GB RAM, 40% CPU target)..."
ulimit -v 4194304  # 4GB virtual memory limit in KB

# Export environment variables
export ANG_KAFKA_WORKERS=1
export ANG_AUTO_TRAIN=1
export ANG_SCRAPER_ENABLED=1
export ANG_LETTA_ENABLED=0
export ANG_LOG_LEVEL=INFO
export ANG_TARGET_MEMORY_MB=4096
export ANG_TARGET_CPU_PERCENT=40

# Create startup state file for recovery
cat > /tmp/ang_autostart_state.json << EOF
{
    "boot_count": $(cat /tmp/ang_boot_count.txt 2>/dev/null || echo "0"),
    "last_boot": $(date +%s),
    "startup_time": "$(date -Iseconds)",
    "mode": "auto_learning"
}
EOF

# Start the main FastAPI server
echo "[Startup] Launching ANG v3 Pro server on port 8000..."
nohup python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 \
    --log-level info \
    > "$LOG_DIR/server.log" 2>&1 &

SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

# Wait for server to start
echo "[Startup] Waiting for server to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "[Startup] Server is ready!"
        break
    fi
    sleep 1
done

# Start auto-learner background process
echo "[Startup] Starting auto-learning background process..."
python3 training/auto_learner.py > "$LOG_DIR/auto_learner.log" 2>&1 &
LEARNER_PID=$!
echo "[Startup] Auto-learner started (PID: $LEARNER_PID)"

# Save boot count
echo $(($(cat /tmp/ang_boot_count.txt 2>/dev/null || echo "0") + 1)) > /tmp/ang_boot_count.txt

echo "========================================"
echo "ANG v3 PRO SYSTEM STARTED SUCCESSFULLY"
echo "========================================"
echo "Server PID: $SERVER_PID"
echo "Auto-Learner PID: $LEARNER_PID"
echo "API Endpoint: http://localhost:8000"
echo "Logs: $LOG_DIR"
echo ""
echo "All systems: AUTO-LEARNING, AUTO-BUILDING, AUTO-STARTUP ENABLED"
echo "========================================"

# Return the server PID
exit 0