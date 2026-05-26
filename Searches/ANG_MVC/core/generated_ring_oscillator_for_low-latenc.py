import numpy as np
# Simple Cell Cycle / Lotka-Volterra Biology Simulator - from: Lotka-Volterra biology dynamics for self-regulating goal engine
def run_ecosystem(steps=1000, dt=0.01):
    x, y = 20.0, 10.0  # prey, predator
    hist = []
    for _ in range(steps):
        dx = 0.5 * x - 0.03 * x * y
        dy = 0.02 * x * y - 0.4 * y
        x += dx * dt
        y += dy * dt
        hist.append((x, y))
    return np.array(hist)

if __name__ == "__main__":
    h = run_ecosystem()
    print("Biology cycle max prey:", np.max(h[:,0]))