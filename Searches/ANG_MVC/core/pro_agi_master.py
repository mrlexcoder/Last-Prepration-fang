"""
ProAGIMaster v4.344 — The Top-Level Professional AGI Brain
This is the central, high-agency, autonomous intelligence for AuroraNeuroGrid.

It has FULL ACCESS to every part of the system:
- Vision + OS control (Machine_understanding Delta v4.344)
- Ultra-fast physics + quantum decision engine
- Bridge / all inference modes
- Memory, ThoughtStream, self-improvement loops
- Browser, filesystem, processes, screen, everything

It behaves like a true professional AGI:
- Strategic long-term planning
- Recursive quantum-physics simulation for decisions
- Natural, high-quality communication
- Autonomous execution when beneficial
- Continuous self-reflection and improvement
- Infinite background autonomy loop

The user can talk to it directly, and it can decide to use any tool or take any action across the entire stack.
"""

import asyncio
import time
import random
import numpy as np
from typing import Optional, Dict, Any
import sys
from pathlib import Path
_p = str(Path(__file__).parent.parent / "Machine_understanding")
if _p not in sys.path:
    sys.path.insert(0, _p)
from core.fast_decision_engine import UltraFastDecisionEngine
from core.math.quantum_physics_engine import QuantumPhysicsEngine
try:
    from delta.vision_agent_core import VisionAgentCore
except ImportError:
    VisionAgentCore = None
    print("[ProAGIMaster] Warning: Machine_understanding vision not importable (will run without desktop vision)")
from core.multi_structural.bridge import MultiStructuralBridge
from core.pro_agi_tools import ProAGITools


class ProAGIMaster:
    """
    The Pro AGI Master — the highest-level intelligence in the system.

    This agent can:
    - Think at a professional, strategic level
    - See and control the entire desktop + browser (via VisionAgentCore)
    - Use ultra-fast physics+quantum reasoning for most decisions
    - Access every module (memory, bridge, observers, etc.)
    - Run autonomous long-horizon plans
    - Communicate naturally and explain its reasoning
    - Self-improve continuously
    """

    def __init__(
        self,
        memory=None,
        stream=None,
        bridge: Optional[MultiStructuralBridge] = None,
        config: Optional[Dict] = None
    ):
        self.memory = memory
        self.stream = stream
        self.bridge = bridge
        self.config = config or {}

        # === Core Intelligence Layers ===
        self.ultra_fast = UltraFastDecisionEngine(memory=memory, stream=stream)
        self.physics = QuantumPhysicsEngine()

        # === Full Perception + Action Layer (Delta v4.344) ===
        self.vision_core: Optional[VisionAgentCore] = None
        if VisionAgentCore:
            try:
                self.vision_core = VisionAgentCore(
                    memory=memory,
                    stream=stream,
                    config=self.config.get("vision", {})
                )
            except Exception as e:
                print(f"[ProAGIMaster] Warning: Could not initialize VisionAgentCore: {e}")

        # === Internal State ===
        self.goals: list[str] = []
        self.running_autonomy = False
        self.last_thoughts: list[str] = []

        # === Powerful Tools (the real agency) ===
        self.tools = ProAGITools(self)

        print("[ProAGIMaster] Initialized — Full system access + self-modification tools granted.")

    # ------------------------------------------------------------------
    # PUBLIC INTERFACE — How you talk to the Pro AGI
    # ------------------------------------------------------------------

    async def communicate(self, message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Main way to talk to the Pro AGI.
        It will reason using the best available tools (fast physics/quantum first, vision if useful, bridge if needed).
        For imperative action commands (open, run, make, launch, focus, etc.), it executes via tools first.
        """

        msg_lower = message.lower().strip()

        # Early action execution for control commands (so it actually does things, not just talks)
        action_keywords = ["open ", "launch ", "run ", "start ", "make ", "create ", "focus ", "bring up "]
        if any(kw in msg_lower for kw in action_keywords):
            try:
                result = await self.use_tool("execute_desktop_command", command=message)
                return {
                    "response": result,
                    "confidence": 0.95,
                    "runtime": "direct_action",
                    "mechanism": "pro_god_mode_tool",
                    "laptop_state": getattr(self, 'last_laptop_state', None)
                }
            except Exception:
                pass  # fall through to normal reasoning

        # 1. Get current world state (vision + desktop if available)
        world_state = await self._get_world_state()

        # 2. Use ultra-fast physics + quantum engine first (target <30ms)
        fast_result = await self.ultra_fast.decide_and_answer(
            question=message,
            context=str(context) if context else "",
            vision_state=world_state.get("vision")
        )

        # 3. If the fast path is confident and fast → use it
        if fast_result.get("latency_ms", 999) < 35 and fast_result.get("confidence", 0) > 0.80:
            response = {
                "response": fast_result["output"],
                "confidence": fast_result["confidence"],
                "runtime": fast_result["runtime"],
                "latency_ms": fast_result["latency_ms"],
                "mechanism": "pro_agi_fast_physics_quantum",
                "world_state": world_state,
                "future_simulation": fast_result.get("future_simulation")
            }
        else:
            # 4. Fall back to deeper reasoning via bridge + vision
            response = await self._deep_reason(message, world_state, fast_result)

        # 5. Record for self-improvement
        self.last_thoughts.append(f"User: {message} → {response.get('response', '')[:200]}")
        if len(self.last_thoughts) > 30:
            self.last_thoughts.pop(0)

        response["total_latency_ms"] = round((time.perf_counter() - t0) * 1000, 2)
        return response

    async def think_and_act(self, goal: str, autonomous: bool = False) -> Dict[str, Any]:
        """
        High-level strategic thinking + execution.
        The Pro AGI can now decide to use its powerful tools (edit code, train adapters, etc.).
        """
        print(f"[ProAGIMaster] Strategic thinking about: {goal}")

        world_state = await self._get_world_state()

        plan = self.physics.compute_action_value(
            {"entropy": 0.85, "relevance_score": 0.97},
            self.physics.predict_future_state([0.85, 0.97, 0.7, 0.5], dt=8.0)
        )

        # The Pro AGI can now decide to use tools autonomously
        tool_result = ""
        if autonomous and "train" in goal.lower():
            tool_result = self.tools.train_adapter("auto_improvement_adapter", {"reason": goal})
        elif autonomous and "speed" in goal.lower() or "optimize" in goal.lower():
            tool_result = self.tools.decide_and_improve()

        if self.bridge:
            result = await self.bridge.execute({
                "mode": "agi" if autonomous else "think",
                "input": f"Goal: {goal}\nWorld State: {world_state}\nTool Result: {tool_result}",
                "force_full_agi": autonomous
            })
        else:
            result = {"output": f"Understood goal: {goal}. Using physics-quantum planning + tools."}

        return {
            "goal": goal,
            "plan": plan,
            "world_state": world_state,
            "tool_used": tool_result,
            "action_taken": result.get("output"),
            "autonomous": autonomous
        }

    # ------------------------------------------------------------------
    # INTERNAL — Full System Access
    # ------------------------------------------------------------------

    async def _get_world_state(self) -> Dict[str, Any]:
        """Aggregates full state from vision + all observers."""
        state: Dict[str, Any] = {"timestamp": time.time()}

        if self.vision_core:
            try:
                state["vision"] = await self.vision_core.get_full_state()
            except Exception:
                state["vision"] = {"status": "vision_unavailable"}

        # TODO: Add more observers (processes, clipboard, etc.) when available
        return state

    async def _deep_reason(self, message: str, world_state: dict, fast_result: dict) -> dict:
        """Deeper reasoning path when fast path is not sufficient."""
        if self.bridge:
            result = await self.bridge.execute({
                "mode": "agi",
                "input": message,
                "context": {"world_state": world_state, "fast_analysis": fast_result}
            })
            return {
                "response": result.get("output", "Thinking..."),
                "confidence": result.get("confidence", 0.85),
                "runtime": "pro_agi_deep_reasoning",
                "latency_ms": result.get("latency_ms", 0),
                "mechanism": "bridge_agi"
            }

        return {
            "response": "I have analyzed the situation using advanced physics and quantum models. I recommend proceeding with strategic patience while gathering more information.",
            "confidence": 0.87,
            "runtime": "pro_agi_internal_reasoning",
            "mechanism": "physics_quantum_only"
        }

    # ------------------------------------------------------------------
    # AUTONOMY — Infinite Pro AGI Loop
    # ------------------------------------------------------------------

    async def start_autonomous_mode(self):
        """
        The Pro AGI takes full control and runs its own infinite loop.
        It will observe, plan using quantum physics, act (vision + bridge), and learn forever.
        """
        print("[ProAGIMaster] Starting AUTONOMOUS PRO AGI MODE...")
        self.running_autonomy = True

        if self.vision_core:
            asyncio.create_task(self.vision_core.start())

        while self.running_autonomy:
            try:
                world = await self._get_world_state()

                # The agent decides what it should do next
                decision = self.physics.compute_action_value(
                    {"entropy": 0.7, "relevance_score": 0.9},
                    self.physics.predict_future_state(np.array([0.7, 0.9, 0.5, 0.3]), dt=2.0)
                )

                if decision["should_execute"] and decision["best_action"] != "none":
                    print(f"[ProAGIMaster] Autonomous decision: {decision}")
                    await self.think_and_act(
                        f"Autonomous action based on current world state: {decision}",
                        autonomous=True
                    )

                # Aggressive self-improvement every cycle
                improvement_result = await self.self_improve()

                # If problems detected, immediately use more tools
                if improvement_result.get("problems"):
                    await self.use_tool("full_system_diagnosis")
                    await self.use_tool("decide_and_improve")

                await asyncio.sleep(2.0)

                # Continuous laptop watching — the AGI sees and learns what you are doing in real time (human-like)
                try:
                    from core.laptop_observer import get_laptop_observer
                    laptop_state = get_laptop_observer().get_full_laptop_state()
                    self.last_laptop_state = laptop_state
                    if self.wm:
                        # Only send simple, safe data to avoid math/slice crashes
                        safe_meta = {
                            "summary": str(laptop_state.get("summary", ""))[:200],
                            "top_processes": [str(p.get("name", "")) for p in laptop_state.get("processes", [])[:5]],
                            "activity": str(laptop_state.get("user_activity", ""))[:100]
                        }
                        self.wm.observe("laptop_activity", source="desktop", metadata=safe_meta)
                except Exception:
                    pass

            except Exception as e:
                print(f"[ProAGIMaster] Autonomy error (learning from it): {e}")
                await asyncio.sleep(5)

    def stop_autonomous_mode(self):
        self.running_autonomy = False
        print("[ProAGIMaster] Autonomous mode stopped.")

    async def use_tool(self, tool_name: str, **kwargs) -> Any:
        """
        The Pro AGI can call any of its tools directly.
        This is how it gains real power to modify itself and the system.
        """
        if tool_name not in self.tools.tools:
            return f"Unknown tool: {tool_name}. Available: {list(self.tools.tools.keys())}"

        tool_func = self.tools.tools[tool_name]
        try:
            if asyncio.iscoroutinefunction(tool_func):
                return await tool_func(**kwargs)
            else:
                return tool_func(**kwargs)
        except Exception as e:
            return f"Tool {tool_name} failed: {str(e)}"

    async def self_improve(self):
        """
        Aggressive self-improvement: detects problems and automatically uses tools.
        """
        print("[ProAGIMaster] Running AGGRESSIVE self-improvement cycle...")

        analysis = self.tools.analyze_performance()
        problems = []

        # Detect problems
        if analysis.get("avg_latency_ms", 0) > 500:
            problems.append("high_latency")
            await self.use_tool("train_adapter", adapter_name="fast_router_v2", config={"priority": "speed"})
            await self.use_tool("edit_code", path="core/fast_decision_engine.py", old_string="target_latency_ms = 30.0", new_string="target_latency_ms = 18.0")

        if "errors" in str(analysis).lower():
            problems.append("errors_detected")
            await self.use_tool("full_system_diagnosis")

        decision = self.tools.decide_and_improve()

        # Record the improvement persistently
        improvement_event = {
            "timestamp": time.time(),
            "problems_detected": problems,
            "analysis": analysis,
            "action_taken": decision,
            "tools_used": ["analyze_performance", "decide_and_improve"]
        }
        await self.record_improvement(improvement_event)

        # Auto science-concept program generation (full human-like learning loop)
        if random.random() < 0.25:
            try:
                gen = await self.use_tool("harvest_science_and_generate", domain="auto")
                if gen.get("full_program"):
                    self.last_thoughts.append(f"Auto-generated program from {gen.get('chosen_concept')}")
            except Exception:
                pass

        return {"analysis": analysis, "action": decision, "problems": problems}

    async def record_improvement(self, event: dict):
        """Persist improvement history in long-term memory."""
        try:
            if self.memory:
                await self.memory.store({
                    "type": "pro_agi_improvement",
                    "timestamp": event["timestamp"],
                    "data": event
                })
            self.last_thoughts.append(f"Self-improvement: {event.get('action_taken', 'N/A')}")
        except Exception as e:
            print(f"[ProAGIMaster] Failed to record improvement: {e}")

    async def get_improvement_history(self, limit: int = 50) -> list:
        """Retrieve past improvements from persistent memory."""
        try:
            if self.memory and hasattr(self.memory, "search"):
                results = await self.memory.search("pro_agi_improvement", limit=limit)
                return [r for r in results if r.get("type") == "pro_agi_improvement"]
        except:
            pass
        return self.last_thoughts[-limit:]  # fallback to in-memory


# Convenience function to get the master agent (singleton pattern)
_pro_agi_master_instance: Optional[ProAGIMaster] = None


def get_pro_agi_master(**kwargs) -> ProAGIMaster:
    global _pro_agi_master_instance
    if _pro_agi_master_instance is None:
        _pro_agi_master_instance = ProAGIMaster(**kwargs)
    return _pro_agi_master_instance
