"""
ANG Pro Device Manager v2 - Hybrid GPU Support
Supports:
- PyTorch (CPU)
- ONNX Runtime (CUDA if available)
- llama.cpp (optional, for future)
"""

import os
import logging
from typing import Optional, Literal

logger = logging.getLogger("ang.device_manager")

Backend = Literal["pytorch", "onnx", "llamacpp", "cpu"]


class DeviceManager:
    def __init__(self, target_vram_fraction: float = 0.5):
        self.target_vram_fraction = target_vram_fraction
        self.backend: Backend = "cpu"
        self.device_name = "CPU"
        self.vram_total_gb = 0.0
        self.vram_usable_gb = 0.0
        self.is_blackwell = False
        self.uses_gpu = False
        self.onnx_providers = []

        self._detect_hardware()

    def _detect_hardware(self):
        """Detect best available acceleration"""
        # 1. Check ONNX Runtime first (best chance for RTX 5050 Blackwell)
        try:
            import onnxruntime as ort
            providers = ort.get_available_providers()
            self.onnx_providers = providers

            if "CUDAExecutionProvider" in providers or "TensorrtExecutionProvider" in providers:
                self.backend = "onnx"
                self.uses_gpu = True
                self.device_name = "RTX 5050 (ONNX CUDA)"
                # Rough estimate - user confirmed 8GB
                self.vram_total_gb = 8.0
                self.vram_usable_gb = self.vram_total_gb * self.target_vram_fraction
                logger.info("ONNX Runtime with CUDA detected → Using GPU for embeddings")
                return
        except ImportError:
            pass

        # 2. Check PyTorch
        try:
            import torch
            if torch.cuda.is_available():
                props = torch.cuda.get_device_properties(0)
                self.device_name = props.name
                self.vram_total_gb = props.total_memory / (1024 ** 3)
                self.vram_usable_gb = self.vram_total_gb * self.target_vram_fraction
                self.is_blackwell = props.major >= 12

                if self.is_blackwell:
                    logger.warning("Blackwell GPU detected but PyTorch CUDA not working. Falling back to CPU.")
                    self.backend = "cpu"
                    self.uses_gpu = False
                else:
                    self.backend = "pytorch"
                    self.uses_gpu = True
                return
        except ImportError:
            pass

        # 3. Fallback to CPU
        self.backend = "cpu"
        self.device_name = "CPU (optimized)"
        self.uses_gpu = False
        logger.info("Using optimized CPU mode")

    def get_embedding_backend(self) -> str:
        """Best backend for embeddings"""
        if self.backend == "onnx" and self.uses_gpu:
            return "onnx"
        return "cpu"

    def get_info(self) -> dict:
        return {
            "backend": self.backend,
            "name": self.device_name,
            "vram_total_gb": round(self.vram_total_gb, 1),
            "vram_usable_gb": round(self.vram_usable_gb, 1),
            "using_gpu": self.uses_gpu,
            "onnx_providers": self.onnx_providers,
            "target_vram_fraction": self.target_vram_fraction,
        }

    def log_status(self):
        info = self.get_info()
        logger.info(f"DeviceManager → {info}")


# Global singleton
_device_manager: Optional[DeviceManager] = None


def get_device_manager(vram_fraction: float = 0.5) -> DeviceManager:
    global _device_manager
    if _device_manager is None:
        _device_manager = DeviceManager(target_vram_fraction=vram_fraction)
    return _device_manager


def get_optimal_embedding_device() -> str:
    """Returns best device string for current embeddings"""
    dm = get_device_manager()
    if dm.get_embedding_backend() == "onnx":
        return "cuda"   # ONNX will use CUDA internally
    return "cpu"
