"""
Persistence utilities for the NeuralManifold (Roadmap Item 9)

Allows the learnable manifold (the "identity" of the AGI) to survive restarts.
"""

import torch
from pathlib import Path
from core.futur_stick.manifold.neural_manifold import NeuralManifold


def save_manifold(manifold: NeuralManifold, path: str = "/tmp/anc_futur_manifold.pt"):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    torch.save({
        "state_dict": manifold.state_dict(),
        "input_dim": manifold.input_dim,
        "latent_dim": manifold.latent_dim,
    }, path)
    print(f"[Persistence] NeuralManifold saved to {path}")


def load_manifold(path: str = "/tmp/anc_futur_manifold.pt") -> NeuralManifold:
    data = torch.load(path, map_location="cpu")
    m = NeuralManifold(input_dim=data["input_dim"], latent_dim=data["latent_dim"])
    m.load_state_dict(data["state_dict"])
    print(f"[Persistence] NeuralManifold loaded from {path}")
    return m
