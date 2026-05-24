# AuroraNeuroGrid v3 Pro - Auto-Learning AI System

## Quick Start

```bash
# Start the system (auto-learning, auto-build, auto-startup enabled)
./scripts/start_ang.sh

# Stop gracefully
./scripts/stop_ang.sh
```

## Features Implemented

### 1. Auto-Startup & Recovery
- **AutoStartManager**: Handles boot/shutdown/reboot recovery
- **Systemd service**: `ang.service` for automatic startup on boot
- **State persistence**: Saves state to `/tmp/ang_autostart_state.json`
- **PID tracking**: `/tmp/ang_master.pid` for process management

### 2. Auto-Learning (3-Track System)
- **Track 1 - Context Learning**: InfinityCache + Mem0 for immediate recall
- **Track 2 - Online LoRA**: Real-time adapter fine-tuning when 8+ high-confidence signals
- **Track 3 - Batch Training**: Accumulated signals for nightly training

### 3. Auto-Build
- **AutoBuilder**: Automatically detects optimization opportunities
- **Performance monitoring**: Latency/confidence-based triggers
- **Code improvement**: Automatic optimization suggestions

### 4. Resource Management
- Target: 4GB RAM, 40% CPU
- System limits enforced via `ulimit`
- Process priority management via `nice`

## API Endpoints

```bash
# Check system health
curl http://localhost:8000/api/health

# Chat mode
curl -X POST http://localhost:8000/api/bridge \
  -H "Content-Type: application/json" \
  -d '{"mode": "chat", "input": "Hello AGI!"}'

# Send learning signal
curl -X POST http://localhost:8000/api/bridge/learn \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "response": "answer", "confidence": 0.9}'

# Get learning stats
curl http://localhost:8000/api/bridge/learn/stats
```

## Files Created/Modified

```
ANG_MVC/
├── core/
│   └── autostart_manager.py    # NEW: Auto-start/shutdown management
├── training/
│   └── auto_learner.py          # NEW: Continuous learning system
├── scripts/
│   ├── start_ang.sh             # NEW: Main startup script
│   └── stop_ang.sh              # NEW: Graceful shutdown
├── ang.service                  # NEW: Systemd service file
├── app.py                       # MODIFIED: Integrated auto-learner
└── controllers/
    └── bridge_controller.py     # MODIFIED: Added learning endpoints
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANG_KAFKA_WORKERS` | 1 | Enable Kafka workers |
| `ANG_AUTO_TRAIN` | 1 | Enable auto-training daemon |
| `ANG_SCRAPER_ENABLED` | 1 | Enable web scraper grid |
| `ANG_LETTA_ENABLED` | 0 | Enable Letta agents |
| `ANG_LOG_LEVEL` | INFO | Logging level |

## Boot Configuration

To enable automatic startup on system boot:

```bash
# Copy service file
sudo cp ang.service /etc/systemd/system/

# Enable service
sudo systemctl enable ang.service

# Start service
sudo systemctl start ang.service
```

## Resource Limits

The system enforces:
- 4GB RAM limit via `ulimit -v 4194304`
- 40% CPU target via nice/ionice
- Process priority adjustment on startup