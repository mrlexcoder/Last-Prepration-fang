# AuroraNeuroGrid MVC App

Professional full-stack AI application with Docker containerization. This folder contains a pro-level MVC scaffold for the AuroraNeuroGrid execution layer, designed for fast decision-making, clean separation of layers, and a lightweight frontend.

## 📅 Latest Update
- **Date:** May 26, 2026
- **Status:** Docker setup verified and ready for deployment
- **Connection:** Successfully connected to GitHub

## 🏗️ Architecture

The application consists of multiple microservices orchestrated via Docker Compose:

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 3000 | React SPA (Nginx) |
| **API** | 8081 | FastAPI Backend (GPU-enabled) |
| **Kafka** | 9092 | Message broker |
| **Zookeeper** | 2181 | Kafka coordination |
| **Qdrant** | 6333 | Vector database |
| **SearXNG** | 8888 | Meta-search engine |
| **Ring Buffer** | 8090 | Rust high-performance buffer |
| **Go Store** | 50051 | gRPC key-value store |

## 🐳 Docker Deployment

### Prerequisites
- Docker & Docker Compose installed
- NVIDIA GPU drivers (optional, for GPU acceleration)
- NVIDIA Container Toolkit (for GPU support)

### Quick Start

```bash
# Navigate to the project directory
cd Searches/ANG_MVC

# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### GPU Support

The setup automatically detects and uses NVIDIA GPUs if available. To force CPU-only mode:

1. Edit `docker-compose.yml`
2. Set `ANG_FORCE_CPU: "1"` in the `api` service environment
3. Remove or comment out the `deploy.resources.reservations.devices` section

### Stop & Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data will be lost!)
docker-compose down -v
```

## 🛠️ Local Development (Without Docker)

```bash
cd Searches/ANG_MVC

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn app:app --host 0.0.0.0 --port 8081
```

Open `http://localhost:8081` in your browser.

## 📁 Project Structure

```
ANG_MVC/
├── app.py                  # FastAPI application entrypoint
├── controllers/            # Request handling and routing
├── services/               # Business logic and execution flow
├── core/                   # Runtime selection and orchestration helpers
├── models/                 # Request/response contracts
├── adapters/               # Runtime adapters and model runtime stubs
├── connectors/             # Connector registry metadata
├── anc_frontend/           # React frontend application
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── storage/
│   ├── rust_ringbuf/       # Rust high-performance ring buffer
│   └── go_store/           # Go gRPC key-value store
├── web_intel/              # Web intelligence and scraping
├── training/               # Auto-training utilities
├── config/
│   └── searxng/            # SearXNG configuration
├── templates/              # Lightweight HTML frontend
├── static/                 # CSS and JavaScript assets
├── Dockerfile              # Backend Docker image
├── docker-compose.yml      # Full stack orchestration
└── requirements.txt        # Python dependencies
```

## 🔧 Configuration

### Environment Variables

Key environment variables (set in `docker-compose.yml`):

| Variable | Description | Default |
|----------|-------------|---------|
| `ANG_HF_MODEL` | HuggingFace model to use | `Qwen/Qwen2.5-0.5B-Instruct` |
| `ANG_FORCE_CPU` | Force CPU-only mode | `0` |
| `ANG_GPU_MEMORY_FRACTION` | GPU memory limit (0.0-1.0) | `0.50` |
| `ANG_LOG_LEVEL` | Logging level | `INFO` |
| `KAFKA_ENABLED` | Enable Kafka messaging | `1` |

### Volumes

| Volume | Purpose |
|--------|---------|
| `zk_data` | Zookeeper data persistence |
| `kafka_data` | Kafka message data |
| `qdrant_data` | Vector database storage |
| `ang_data` | Go store data |
| `ang_adapters` | Adapter configurations |
| `ang_cache` | Application cache |
| `hf_cache` | HuggingFace model cache |

## 🚀 Features

- **GPU Acceleration**: 50% GPU memory limit with 4-bit inference
- **Message Queue**: Kafka for asynchronous processing
- **Vector Search**: Qdrant for semantic search and RAG
- **Web Intelligence**: Integrated web scraping and search via SearXNG
- **High Performance**: Rust ring buffer for low-latency operations
- **Persistent Storage**: Go-based gRPC key-value store
- **Modern Frontend**: React SPA with Nginx

## 📝 Notes

- The Docker setup is production-ready and includes all necessary services
- GPU support requires NVIDIA Container Toolkit installation
- All data is persisted in Docker volumes for durability
- The application is designed to run with minimal configuration

---

*Last updated: May 26, 2026 | Docker setup verified*