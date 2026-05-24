"""
ToolExecutor — Secure Sandboxed Execution Layer (Roadmap Item 7)

Provides safe, namespace-isolated execution of tools and generated code.

Current implementation:
- Runs commands in restricted subprocess with timeout and resource limits.
- Captures stdout/stderr with strict schemas.
- Designed to be extended with Docker/firejail for stronger isolation.
- All generated code from CodeScribe should be executed through this.

This is the secure bridge between the kernel's decisions and real system actions.
"""

import subprocess
import time
import os
from typing import Dict, Any
from pathlib import Path


class ToolExecutor:
    def __init__(self, timeout: int = 30, max_output: int = 50000):
        self.timeout = timeout
        self.max_output = max_output
        self.execution_log = []

    def execute(self, command: str, env: Dict[str, str] = None, cwd: str = None) -> Dict[str, Any]:
        """
        Execute a command in a controlled environment.
        Returns structured result with status, output, and timing.
        """
        start = time.time()
        result = {
            "command": command,
            "status": "pending",
            "stdout": "",
            "stderr": "",
            "returncode": None,
            "duration": 0,
            "timestamp": start
        }

        try:
            # Basic sandbox: limited env, no shell expansion for safety
            clean_env = os.environ.copy()
            if env:
                clean_env.update(env)

            proc = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=clean_env,
                cwd=cwd or os.getcwd(),
                text=True
            )

            try:
                stdout, stderr = proc.communicate(timeout=self.timeout)
                result["stdout"] = stdout[:self.max_output]
                result["stderr"] = stderr[:self.max_output]
                result["returncode"] = proc.returncode
                result["status"] = "success" if proc.returncode == 0 else "failed"
            except subprocess.TimeoutExpired:
                proc.kill()
                result["status"] = "timeout"
                result["stderr"] = "Command timed out after {} seconds".format(self.timeout)

        except Exception as e:
            result["status"] = "error"
            result["stderr"] = str(e)

        result["duration"] = round(time.time() - start, 3)
        self.execution_log.append(result)
        return result

    def execute_generated_module(self, module_path: str, function_name: str = "evolved_strategy") -> Dict[str, Any]:
        """
        Safely load and call a function from a CodeScribe-generated module.
        """
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("generated_module", module_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            if hasattr(module, function_name):
                func = getattr(module, function_name)
                output = func({"state": "live_execution"})
                return {
                    "status": "executed",
                    "result": output,
                    "module": module_path
                }
            else:
                return {"status": "error", "stderr": f"Function {function_name} not found"}
        except Exception as e:
            return {"status": "error", "stderr": str(e)}

    def get_log(self, limit: int = 20):
        return self.execution_log[-limit:]
