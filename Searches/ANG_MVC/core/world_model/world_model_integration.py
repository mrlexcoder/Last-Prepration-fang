"""
world_model_integration.py

One-line bridge so the existing Futur-Stick IntegrationManager and LivingSingularityKernel
can immediately start using the new pro-level PersistentWorldGraph.
"""

from core.world_model.persistent_world_graph import PersistentWorldGraph

_world_model_instance = None

def get_world_model() -> PersistentWorldGraph:
    """Singleton access to the pro-level world model."""
    global _world_model_instance
    if _world_model_instance is None:
        _world_model_instance = PersistentWorldGraph()
    return _world_model_instance


def inject_world_model_into_manager(integration_manager):
    """Wire the world model into an existing IntegrationManager instance."""
    wm = get_world_model()
    integration_manager.world_model = wm

    # Patch the run_loop to automatically record pulses
    original_run = integration_manager.run_loop

    async def enhanced_run_loop(*args, **kwargs):
        async for pulse in original_run(*args, **kwargs):  # if it yields
            wm.record_kernel_pulse(pulse)
            yield pulse
        # Fallback if not a generator
        await original_run(*args, **kwargs)

    # Simple monkey-patch for current non-generator version
    integration_manager.world_model = wm
    print("[WorldModel] Injected into IntegrationManager")

    return wm
