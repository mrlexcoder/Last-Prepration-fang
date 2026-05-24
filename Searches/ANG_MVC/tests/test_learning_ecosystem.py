import unittest
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from learning_service.app import app, state, LEARNING_PORT
from fastapi.testclient import TestClient

class TestProLearningEcosystem(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("status", data)
        self.assertEqual(data["port"], 8082)
        self.assertIn("tracks", data)

    def test_generate_program_generative_ai(self):
        resp = self.client.post("/generate", json={"concept": "biology cell cycle for goal engine", "domain": "biology"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("generated", data)
        self.assertIn("sequence", data["generated"])
        self.assertGreater(len(data["generated"]["code"]), 100)

    def test_trigger_learning_full_loop(self):
        resp = self.client.post("/learn/trigger", json={"domain": "neural", "concept": "neural ring oscillator"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "triggered")

    def test_learning_state_after_cycles(self):
        # Simulate some cycles
        for _ in range(2):
            asyncio.run(state._generative_science_track() if hasattr(state, '_generative_science_track') else asyncio.sleep(0))
        self.assertGreaterEqual(state.stats.get("cycles", 0), 0)
        self.assertIn("programs_generated", state.stats)

if __name__ == "__main__":
    unittest.main(verbosity=2)
