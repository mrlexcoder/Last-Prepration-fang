#!/bin/bash
# =============================================================================
# ANG Cron entry — called by crontab every 6 hours for log rotation.
# =============================================================================
bash /home/mrlexcoder/Last-Prepration-fang/Searches/ANG_MVC/scripts/ang_rotate_logs.sh >> /home/mrlexcoder/Last-Prepration-fang/Searches/ANG_MVC/logs/rotate.log 2>&1
