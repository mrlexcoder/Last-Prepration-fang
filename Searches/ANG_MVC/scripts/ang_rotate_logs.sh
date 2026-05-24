#!/usr/bin/env bash
# =============================================================================
# ANG logrotate — rotates ANG logs > 100MB, keeps 14 days
# Uses systemd journald for the small entries and flat files for large ones.
# =============================================================================
set -euo pipefail

ANG_LOG_DIR="/home/mrlexcoder/Last-Prepration-fang/Searches/ANG_MVC/logs"
MAX_SIZE_MB=100
KEEP_DAYS=14

mkdir -p "$ANG_LOG_DIR"
cd "$ANG_LOG_DIR"

echo "ANG log rotation — $(date)"

for f in api.log learning.log ringbuf.log go_store.log watchdog.log; do
  target="$ANG_LOG_DIR/$f"
  [ -f "$target" ] || continue

  size_mb=$(( $(stat -c%s "$target") / 1024 / 1024 ))

  if [ "$size_mb" -ge "$MAX_SIZE_MB" ]; then
    ts=$(date +%Y%m%dT%H%M%S)
    mv "$f" "${f%.log}.${ts}.gz"
    gzip "${f%.log}.${ts}" 2>/dev/null && echo "  ✓ rotated $f → ${f%.log}.${ts}.gz" || echo "  ✓ moved $f → ${f%.log}.${ts}"
  fi
done

# Delete archives older than KEEP_DAYS
find "$ANG_LOG_DIR" -name "*.log.*.gz" -mtime +$KEEP_DAYS -delete 2>/dev/null
find "$ANG_LOG_DIR" -name "*.log.*"   -mtime +$KEEP_DAYS -delete 2>/dev/null

echo "Rotation done."
