import numpy as np
# Physics + Quantum-inspired Simulator for concept: quantum random walk for counterfactual exploration in WorldModel
def quantum_walk(steps=200, dim=2):
    pos = np.zeros(dim)
    trajectory = [pos.copy()]
    for _ in range(steps):
        direction = np.random.randn(dim)
        direction /= np.linalg.norm(direction)
        pos += direction * 0.1
        trajectory.append(pos.copy())
    return np.array(trajectory)

if __name__ == "__main__":
    traj = quantum_walk()
    print("Final displacement:", np.linalg.norm(traj[-1]))