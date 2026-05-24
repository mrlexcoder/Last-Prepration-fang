#!/bin/bash
# ============================================================
# ANG Pro GPU Setup Helper for RTX 5050 (sm_120 / Blackwell)
# Date: May 2026
#
# This script tries to install the best available PyTorch
# for your low-VRAM Blackwell GPU.
# ============================================================

set -e

echo "=== ANG Pro GPU Setup for RTX 5050 (4GB Blackwell) ==="
echo "This will try to get the best possible GPU support."
echo ""

# Check current GPU
if ! command -v nvidia-smi &> /dev/null; then
    echo "nvidia-smi not found. Cannot proceed with GPU setup."
    exit 1
fi

nvidia-smi --query-gpu=name,compute_cap,memory.total --format=csv,noheader

echo ""
read -p "Do you want to proceed with attempting GPU support? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted by user."
    exit 0
fi

# Activate venv if exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "Activated existing .venv"
else
    echo "No .venv found. Creating one..."
    python3 -m venv .venv
    source .venv/bin/activate
fi

pip install --upgrade pip setuptools wheel

echo ""
echo "Trying latest PyTorch with best Blackwell support (as of May 2026)..."

# Try CUDA 12.8 (latest common for Blackwell in 2026)
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128

echo ""
echo "Installing bitsandbytes for 4-bit/8-bit quantization (important for 4GB VRAM)"
pip install bitsandbytes --upgrade

echo ""
echo "Testing if CUDA actually works with your RTX 5050..."

python3 -c "
import torch
print('PyTorch version:', torch.__version__)
print('CUDA available:', torch.cuda.is_available())
if torch.cuda.is_available():
    print('GPU Name:', torch.cuda.get_device_name(0))
    print('Compute Capability:', torch.cuda.get_device_capability(0))
    print('Total VRAM (GB):', round(torch.cuda.get_device_properties(0).total_memory / 1e9, 2))
    try:
        x = torch.zeros(1, device='cuda')
        print('Basic CUDA tensor creation: SUCCESS')
    except Exception as e:
        print('CUDA test failed:', e)
else:
    print('CUDA not available after installation.')
"

echo ""
echo "GPU setup attempt finished."
echo "If you still see 'no kernel image' errors, you will need to stay on CPU for now."
echo "You can force CPU mode by running: ./agi start (it will auto-detect safely)"
