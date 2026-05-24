"""
Quick usage example for the Pro AGI Master.

After starting the server, you can interact with the highest-level AGI like this:

from core.multi_structural.bridge import MultiStructuralBridge
from core.pro_agi_master import get_pro_agi_master

# Assuming you have your infer function and bridge ready
# bridge = ...

pro_agi = get_pro_agi_master(bridge=bridge)

# Natural conversation
response = await pro_agi.communicate("What should I focus on right now to advance the project?")

# Strategic autonomous thinking
result = await pro_agi.think_and_act("Improve the overall speed and intelligence of the entire ANG system", autonomous=False)

# Full autonomous mode (the agent takes control)
# await pro_agi.start_autonomous_mode()
"""

print("Pro AGI Master is ready. Talk to it via bridge.talk_to_pro_agi() or get_pro_agi_master().")
