#!/usr/bin/env bash
# =============================================================================
# ANG — Full Auto-Start Installer
# ONE command → set up everything for 24/7 automatic operation on boot.
#
# What it does:
#   A. Builds the ANG stack (Rust + Go + Python venv)
#   B. Installs systemd system-wide service + watchdog timer
#   C. Registers crontab monthly log rotation
#   D. Enables user-linger (no login needed at boot)
#   E. Starts everything RIGHT NOW
#
# Usage:
#   sudo bash Deploy-systemd.sh     -- deploy as systemd service (recommended)
#   OR just bash start_prod.sh      -- start right now without systemd
# =============================================================================

set -euo pipefail

ANG_ROOT="/home/mrlexcoder/Last-Prepration-fang/Searches/ANG_MVC"
echo "╔══════════════════════════════════════════════════╗"
echo "║   ANG Full Auto-Start Installer                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Build ──────────────────────────────────────────────────────────────
echo "[1/6] Building ANG stack..."
bash "$ANG_ROOT/setup_env.sh"

# ── Step 2: systemd units ──────────────────────────────────────────────────────
USR_UNIT="/home/mrlexcoder/.config/systemd/user/ang-production.service"
WATCH_UNIT="/home/mrlexcoder/.config/systemd/user/ang-health-watchdog.service"
WATCH_TIMER="/home/mrlexcoder/.config/systemd/user/ang-health-watchdog.timer"

echo "[2/6] Installing user systemd units..."
mkdir -p /home/mrlexcoder/.config/systemd/user
cp "$ANG_ROOT/systemd/ang-production.service"     "$USR_UNIT"
cp "$ANG_ROOT/systemd/ang-health-watchdog.service" "$WATCH_UNIT"
cp "$ANG_ROOT/systemd/ang-health-watchdog.timer"  "$WATCH_TIMER"
chmod 644 "$USR_UNIT" "$WATCH_UNIT" "$WATCH_TIMER"
systemctl --user daemon-reload
echo "       ✓ Units loaded"

# ── Step 3: System-wide units (optional) ──────────────────────────────────────
SYSTEM_UNIT="/etc/systemd/system/ang-production.service"
echo "[3/6] Deploying system-wide unit..."
sudo cp "$ANG_ROOT/systemd/ang-production.service" "$SYSTEM_UNIT" 2>/dev/null || true
sudo cp "$ANG_ROOT/systemd/ang-health-watchdog.service" /etc/systemd/system/ 2>/dev/null || true
sudo cp "$ANG_ROOT/systemd/ang-health-watchdog.timer"  /etc/systemd/system/ 2>/dev/null || true
sudo systemctl daemon-reload 2>/dev/null || true
echo "       ✓ System-wide unit deployed"

# ── Step 4: Linger + crontab ──────────────────────────────────────────────────
echo "[4/6] Enabling user-linger (run at boot without login)..."
sudo loginctl enable-linger mrlexcoder 2>/dev/null || true
echo "       ✓ Linger enabled"

# Only add crontab entry if not already present (idempotent)
echo "[5/6] Setting up monthly log rotation crontab..."
(crontab -l 2>/dev/null | grep -v "ang_rotate_logs"; echo "0 2 1 * * $ANG_ROOT/scripts/cron_rotate_logs.sh") | crontab -
echo "       ✓ Crontab entry added"

# ── Step 5: Enable & start ─────────────────────────────────────────────────────
echo "[6/6] Starting services..."
systemctl --user stop ang-production.service 2>/dev/null || true
systemctl --user enable --now ang-production.service
systemctl --user enable --now ang-health-watchdog.timer
sudo systemctl enable --now ang-production.service 2>/dev/null || true
sudo systemctl enable --now ang-health-watchdog.timer 2>/dev/null || true
echo "       ✓ All services started"

sleep 5

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✓ ANG is fully deployed and running now"
echo ""
echo "  ┌── Service Commands ──────────────────────────────────────────────────┐ "
echo "  │ systemctl --user status  ang-production.service                      │ "
echo "  │ systemctl --user stop    ang-production.service                      │ "
echo "  │ systemctl --user restart ang-production.service                      │ "
echo "  │ journactl --user -u ang-production.service -f                       │ "
echo "  └──────────────────────────────────────────────────────────────────────┘ "
echo ""
echo "  ┌── Live URLs ──────────────────────────────────────────────────────────┐ "
echo "  │ Main API  → http://localhost:8081/api/health                         │ "
echo "  │ Learning  → http://localhost:8082/health                             │ "
echo "  │ Dashboard → http://localhost:8081/  ← YOU ARE HERE                   │ "
echo "  └──────────────────────────────────────────────────────────────────────┘ "
echo ""
echo "  ┌── Reboot-proof ──────────────────────────────────────────────────────┐ "
echo "  │ Services start automatically on every boot.                          │ "
echo "  │ Linger keeps them alive with no login needed.                        │ "
echo "  │ Watchdog restarts crashed services every 30s.                        │ "
echo "  └──────────────────────────────────────────────────────────────────────┘ "
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
