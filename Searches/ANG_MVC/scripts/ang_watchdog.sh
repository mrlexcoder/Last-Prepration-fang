#!/usr/bin/env bash
# =============================================================================
# ANG Health Watchdog — runs every 30s via systemd timer
# Checks every ANG service; if any is down, restarts the whole stack.
# Also persists a machine-readable health JSON for the live dashboard.
# =============================================================================
set -euo pipefail

ANG_ROOT="${ANG_ROOT:-/home/mrlexcoder/Last-Prepration-fang/Searches/ANG_MVC}"
LOG_DIR="$ANG_ROOT/logs"
HEALTH_JSON="$ANG_ROOT/web_dashboard/health.json"
mkdir -p "$LOG_DIR" "$(dirname "$HEALTH_JSON")"

API_PORT=8081
LEARN_PORT=8082
RINGBUF_URL="http://localhost:8090"
MAX_WAIT=20   # seconds to wait for any service to respond

any_down=0

check() {
  local name="$1" url="$2" pid_pattern="$3"
  local code
  code=$(curl -sf --connect-timeout 2 --max-time 4 "$url" -o /dev/null -w "%{http_code}" 2>/dev/null) || code="000"
  if [ "$code" = "000" ] || [ "$code" = "0001" ]; then
    if pgrep -f "$pid_pattern" > /dev/null 2>&1; then
      echo "[watchdog] $name: HTTP down but PID alive (result=$code) — waiting..."
      return 0
    else
      echo "[$(date)] WATCHDOG: $name DOWN (result=$code, no PID) → triggering restart" | tee -a "$LOG_DIR/watchdog.log"
      any_down=1
      return 1
    fi
  else
    return 0
  fi
}

check "ringbuf"  "$RINGBUF_URL/health"           "ang_ringbuf"
check "go_store" "$RINGBUF_URL/health"            "ang_store"
check "api"      "http://localhost:$API_PORT/api/health"  "uvicorn app:app"
check "learning" "http://localhost:$LEARN_PORT/health"    "learning_service"

# Update health JSON for the live dashboard
 cat > "$HEALTH_JSON" << JSONEOF
{
  "updated_at": "$(date -Iseconds 2>/dev/null || date '+%Y-%m-%dT%H:%M:%S%:z')",
  "api":      "$(curl -sf --connect-timeout 1 --max-time 3 "http://localhost:$API_PORT/api/health" 2>/dev/null || echo 'DOWN')",
  "learning": "$(curl -sf --connect-timeout 1 --max-time 3 "http://localhost:$LEARN_PORT/health" 2>/dev/null || echo 'DOWN')",
  "ringbuf":  "$(curl -sf --connect-timeout 1 --max-time 3 "$RINGBUF_URL/health"    2>/dev/null || echo 'DOWN')",
  "go_store": "$(curl -sf --connect-timeout 1 --max-time 3 "$RINGBUF_URL/health"    2>/dev/null || echo 'DOWN')"
}
JSONEOF

if [ "$any_down" -eq 1 ]; then
  echo "[$(date)] WATCHDOG: Restarting all services..." | tee -a "$LOG_DIR/watchdog.log"
  "$ANG_ROOT/stop.sh" > /dev/null 2>&1 || true
  sleep 3
  "$ANG_ROOT/start_prod.sh" >> "$LOG_DIR/watchdog.log" 2>&1
  echo "[$(date)] WATCHDOG: Restart complete" | tee -a "$LOG_DIR/watchdog.log"
fi
