import unittest
import asyncio
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from core.pro_agi_master import get_pro_agi_master
from core.adapter_pool import WarmAdapterPool
from core.cmu_router import CognitiveMotorRouter
from core.fast_decision_engine import UltraFastDecisionEngine
from core.math.quantum_physics_engine import QuantumPhysicsEngine
from core.math import QuantumPhysicsEngine as QPE2
from core.multi_structural.bridge import MultiStructuralBridge
from core.scientific_concept_generator import generate_from_concept
from web_intel.scraper_grid import ScraperGrid, get_scraper_grid, SCRAPER_SITES
class TestProAGIMaster(unittest.TestCase):
    def test_instantiation(self):
        master = get_pro_agi_master(memory=None, stream=None, bridge=None, config={})
        self.assertIsNotNone(master)
        self.assertTrue(hasattr(master, "physics"))
        self.assertTrue(hasattr(master, "ultra_fast"))
        self.assertFalse(master.running_autonomy)
    def test_tools_available(self):
        master = get_pro_agi_master(memory=None, bridge=None)
        self.assertTrue(hasattr(master, "tools"))
        self.assertTrue(hasattr(master.tools, "tools"))
class TestAdapterPool(unittest.TestCase):
    def test_init(self):
        pool = WarmAdapterPool(registry={})
        self.assertIsNotNone(pool)
    def test_update_registry(self):
        pool = WarmAdapterPool()
        pool.update_registry({"a":1})
        self.assertEqual(pool._registry, {"a":1})
class TestCMURouter(unittest.TestCase):
    def test_init_and_route(self):
        cmu = CognitiveMotorRouter(cache=None)
        self.assertIsNotNone(cmu)
        res = asyncio.run(cmu.route("what is 2+2?"))
        self.assertIn("cmu", res)
class TestFastDecision(unittest.TestCase):
    def test_init(self):
        eng = UltraFastDecisionEngine(memory=None)
        self.assertIsNotNone(eng)
class TestQuantumPhysicsEngine(unittest.TestCase):
    def test_core_math_import(self):
        q = QuantumPhysicsEngine()
        self.assertIsNotNone(q)
        self.assertTrue(hasattr(q, "predict_future_state"))
        q2 = QPE2()
        self.assertIsNotNone(q2)
    def test_action_value(self):
        q = QuantumPhysicsEngine()
        val = q.compute_action_value({"entropy":0.8,"relevance_score":0.7}, [0.5,0.6])
        self.assertIn("best_action", val)
class TestProRichAnswers(unittest.TestCase):
    def test_capability_query_uses_pro_reflex(self):
        async def dummy(p): return {"output":"stub","confidence":0.5}
        b = MultiStructuralBridge(infer_fn=dummy)
        res = asyncio.run(b.execute("chat", {"input": "what can you do? what is your ability?"}))
        self.assertIn("ProAGIMaster", res.get("output",""))
        self.assertGreater(len(res.get("output","")), 400)
        self.assertEqual(res.get("runtime"), "pro-reflex-v3")
class TestScientificGenerator(unittest.TestCase):
    def test_generates_program_from_neural_concept(self):
        res = generate_from_concept("neural oscillation in cortical columns", "neural")
        self.assertIn("sequence", res)
        self.assertGreater(len(res["code"]), 200)
        self.assertIn("numpy", res["code"])
        self.assertIn("ring", res["code"].lower())
    def test_build_sequence_tool(self):
        from core.pro_agi_tools import ProAGITools
        # minimal master mock
        class Dummy: pass
        tools = ProAGITools(Dummy())
        seq = tools.generate_build_sequence("add biology cell simulator to ANG")
        self.assertIn("build_sequence", seq)
        self.assertIn("generated_program", seq)
    def test_harvest_science_and_generate(self):
        from core.pro_agi_tools import ProAGITools
        class Dummy: pass
        tools = ProAGITools(Dummy())
        res = tools.harvest_science_and_generate("neural")
        self.assertIn("chosen_concept", res)
        self.assertIn("full_program", res)
    def test_scraper_grid_pro(self):
        self.assertGreater(len(SCRAPER_SITES), 5)
        self.assertTrue(any("biology" in s["category"] or "neural" in s["category"] for s in SCRAPER_SITES))
if __name__ == "__main__":
    unittest.main(verbosity=2)
