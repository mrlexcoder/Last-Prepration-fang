# =============================================================================
# AuroraNeuroGrid (ANG) v3 — Production GPU-enabled Dockerfile
# Supports CUDA 12.4 + 50% GPU memory limit + 4-bit inference
# =============================================================================
FROM nvidia/cuda:12.4.1-cudnn9-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/root/.cache/huggingface \
    TRANSFORMERS_CACHE=/root/.cache/huggingface

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 python3.11-venv python3-pip \
    build-essential git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create venv
RUN python3.11 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install CUDA-enabled PyTorch + bitsandbytes (critical for 4-bit + 50% limit)
RUN pip install --no-cache-dir \
    torch==2.4.1+cu124 \
    torchvision==0.19.1+cu124 \
    torchaudio==2.4.1+cu124 \
    --extra-index-url https://download.pytorch.org/whl/cu124 && \
    pip install --no-cache-dir bitsandbytes==0.43.1 accelerate==1.7.0

# Install remaining Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright (for JS scraping)
RUN playwright install chromium --with-deps 2>/dev/null || true

# Copy source
COPY . .

# Generate gRPC stubs (non-fatal)
RUN python -m grpc_tools.protoc \
    -I storage/go_store \
    --python_out=storage/go_store \
    --grpc_python_out=storage/go_store \
    storage/go_store/proto/ang_store.proto 2>/dev/null || true

# Hugging Face cache volume
VOLUME ["/root/.cache/huggingface"]

EXPOSE 8081

# Production: 1 worker recommended when using GPU (avoid multiple model copies)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081", "--workers", "1"]
