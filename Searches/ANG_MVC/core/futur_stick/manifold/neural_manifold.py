"""
NeuralManifold — Learnable, Differentiable Fractal Manifold (Roadmap Item 2)

Replaces the static hand-crafted FractalQuantumNeuralManifold with a real PyTorch neural network.

The manifold weights ARE the identity of the AGI.
It is trained online with self-supervised objectives:
- Reconstruction
- Future-state prediction (next snapshot)
- Novelty / prediction error

This is the heart of the pro-level self-evolving system.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, Tuple
import numpy as np


class NeuralManifold(nn.Module):
    def __init__(self, input_dim: int = 2048, latent_dim: int = 4096):
        super().__init__()
        self.input_dim = input_dim
        self.latent_dim = latent_dim

        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 2048),
            nn.GELU(),
            nn.Linear(2048, latent_dim),
        )

        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 1024),
            nn.GELU(),
            nn.Linear(1024, input_dim),
        )

        self.predictor = nn.Sequential(   # future state predictor (stays in latent space)
            nn.Linear(latent_dim, 1024),
            nn.GELU(),
            nn.Linear(1024, latent_dim),
        )

        self.optimizer = torch.optim.Adam(self.parameters(), lr=1e-3)
        self.device = torch.device("cpu")
        self.to(self.device)

    def _to_tensor(self, snapshot: Dict[str, Any]) -> torch.Tensor:
        """Crude but effective deterministic embedding of any snapshot dict."""
        text = str(snapshot)[:8000]
        vec = np.zeros(self.input_dim, dtype=np.float32)
        for i, c in enumerate(text[:self.input_dim]):
            vec[i] = (ord(c) % 127) / 127.0
        return torch.tensor(vec, device=self.device).unsqueeze(0)

    def forward(self, snapshot: Dict[str, Any]) -> torch.Tensor:
        x = self._to_tensor(snapshot)
        return self.encoder(x)

    def reconstruct(self, latent: torch.Tensor) -> torch.Tensor:
        return self.decoder(latent)

    def predict_future(self, latent: torch.Tensor) -> torch.Tensor:
        return self.predictor(latent)

    def train_step(self, snapshot: Dict[str, Any], next_snapshot: Dict[str, Any]) -> float:
        """Online self-supervised training step."""
        self.optimizer.zero_grad()

        latent = self.forward(snapshot)
        recon = self.reconstruct(latent)
        future_pred = self.predict_future(latent)

        target = self._to_tensor(snapshot)
        next_target = self._to_tensor(next_snapshot)

        recon_loss = F.mse_loss(recon, target)
        # Future prediction is in latent space — decode it for loss
        future_decoded = self.reconstruct(future_pred)
        future_loss = F.mse_loss(future_decoded, next_target)

        loss = recon_loss + 0.7 * future_loss
        loss.backward()
        self.optimizer.step()

        return float(loss.item())

    def get_latent(self, snapshot: Dict[str, Any]) -> np.ndarray:
        with torch.no_grad():
            return self.forward(snapshot).squeeze(0).cpu().numpy()
