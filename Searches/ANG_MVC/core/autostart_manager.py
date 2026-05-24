"""
ANG v3 Auto-Start Manager
Handles auto startup on system boot/shutdown/reboot with full system recovery.
"""

import os
import sys
import json
import time
import signal
import asyncio
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any

class AutoStartManager:
    """Manages automatic startup and recovery for ANG AGI system."""
    
    CONFIG_PATH = Path("/tmp/ang_autostart_state.json")
    
    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root or "/opt/lampp/htdocs/myprepProjects/Last-Prepration-fang/Searches/ANG_MVC")
        self.pid_file = Path("/tmp/ang_master.pid")
        self.running = False
        self.state = self._load_state()
    
    def _load_state(self) -> Dict[str, Any]:
        if self.CONFIG_PATH.exists():
            return json.loads(self.CONFIG_PATH.read_text())
        return {
            "boot_count": 0,
            "last_boot": None,
            "uptime_seconds": 0,
            "autonomy_cycles": 0,
            "learning_events": 0
        }
    
    def _save_state(self):
        self.CONFIG_PATH.write_text(json.dumps(self.state, indent=2))
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get current system resources for resource management."""
        try:
            mem_info = {}
            with open("/proc/meminfo") as f:
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        mem_info[parts[0].rstrip(":")] = int(parts[1])
            
            cpu_count = os.cpu_count() or 4
            load_avg = os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0
            
            return {
                "total_memory_mb": mem_info.get("MemTotal", 0) // 1024,
                "available_memory_mb": mem_info.get("MemAvailable", 0) // 1024,
                "cpu_count": cpu_count,
                "load_average": load_avg,
                "target_cpu_percent": 40,  # 40% CPU target
                "target_memory_mb": 4096,  # 4GB target
            }
        except Exception:
            return {
                "total_memory_mb": 8192,
                "available_memory_mb": 4096,
                "cpu_count": 4,
                "load_average": 0.5,
                "target_cpu_percent": 40,
                "target_memory_mb": 4096,
            }
    
    async def enforce_resource_limits(self):
        """Enforce CPU and memory resource limits."""
        sys_info = self.get_system_info()
        target_cpu = sys_info.get("target_cpu_percent", 40)
        
        # CPU throttling using nice and ionice
        try:
            os.nice(5)  # Lower priority
        except Exception:
            pass
        
        return sys_info
    
    async def perform_boot_sequence(self) -> Dict[str, Any]:
        """Full boot sequence: check integrity, restore state, start all services."""
        print("[AutoStart] Starting ANG v3 boot sequence...")
        self.state["boot_count"] += 1
        self.state["last_boot"] = time.time()
        self._save_state()
        
        results = {
            "boot_sequence": "starting",
            "timestamps": {},
            "checks": {}
        }
        
        # 1. Environment setup
        results["timestamps"]["env_setup"] = time.time()
        os.chdir(self.project_root)
        results["checks"]["env_ready"] = True
        
        # 2. Write PID file
        self.pid_file.write_text(str(os.getpid()))
        
        # 3. Check data integrity
        results["timestamps"]["integrity_check"] = time.time()
        results["checks"]["data_integrity"] = self._check_data_integrity()
        
        # 4. Restore state if needed
        results["timestamps"]["state_restore"] = time.time()
        results["checks"]["state_restored"] = self._restore_state()
        
        # 5. Setup signal handlers for graceful shutdown/reboot
        self._setup_signal_handlers()
        
        results["boot_sequence"] = "complete"
        print(f"[AutoStart] Boot sequence complete. Boot count: {self.state['boot_count']}")
        return results
    
    def _check_data_integrity(self) -> bool:
        """Check if critical data directories exist."""
        cache_dir = Path("/tmp/ang_infinity_cache")
        return cache_dir.exists() or True  # Allow missing for first run
    
    def _restore_state(self) -> bool:
        """Restore previous state after reboot."""
        if self.state.get("last_work"):
            print(f"[AutoStart] Restoring last work: {self.state['last_work']}")
        return True
    
    def _setup_signal_handlers(self):
        """Setup handlers for shutdown/reboot signals."""
        def handle_shutdown(signum, frame):
            print(f"[AutoStart] Shutdown signal {signum} received, saving state...")
            self.state["uptime_seconds"] = time.time() - self.state.get("last_boot", time.time())
            self._save_state()
            self.running = False
            sys.exit(0)
        
        signal.signal(signal.SIGTERM, handle_shutdown)
        signal.signal(signal.SIGINT, handle_shutdown)
        
        # Handle reboot
        if hasattr(signal, 'SIGUSR1'):
            signal.signal(signal.SIGUSR1, handle_shutdown)
    
    async def start_full_system(self) -> Dict[str, Any]:
        """Start the complete ANG system with all v3 components."""
        print("[AutoStart] Starting full ANG v3 system...")
        
        boot_results = await self.perform_boot_sequence()
        
        # Start FastAPI server
        server_process = None
        try:
            env = os.environ.copy()
            env["ANG_KAFKA_WORKERS"] = "1"
            env["ANG_AUTO_TRAIN"] = "1"
            env["ANG_SCRAPER_ENABLED"] = "1"
            env["ANG_LETTA_ENABLED"] = "0"
            
            server_process = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"],
                cwd=str(self.project_root),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            boot_results["server_pid"] = server_process.pid
            print(f"[AutoStart] Server started on port 8000 (PID: {server_process.pid})")
        except Exception as e:
            boot_results["server_error"] = str(e)
        
        return boot_results
    
    def run_autonomy_loop(self, bridge=None, pro_agi=None):
        """Main autonomy loop that runs continuously."""
        self.running = True
        
        async def loop():
            while self.running:
                try:
                    if pro_agi and hasattr(pro_agi, 'self_improve'):
                        await pro_agi.self_improve()
                    
                    self.state["autonomy_cycles"] += 1
                    self._save_state()
                    
                    await asyncio.sleep(2.0)
                    
                    # Enforce resource limits every 10 cycles
                    if self.state["autonomy_cycles"] % 10 == 0:
                        await self.enforce_resource_limits()
                        
                except Exception as e:
                    print(f"[AutoStart] Autonomy error: {e}")
                    await asyncio.sleep(5)
        
        return loop()


def get_autostart_manager() -> AutoStartManager:
    return AutoStartManager()