"""
DesktopControl v4.344 — Pro-level full Linux desktop control for ANG

Exposes:
- Mouse (smooth physics-based from Delta)
- Keyboard
- Window management
- Browser control
- App launching
- Full environment actions from voice

This makes the AGI able to literally "do" anything on the laptop via voice.
"""

import asyncio
import subprocess
import os
from pathlib import Path
from typing import Dict, Any, Tuple

# Try to use advanced Delta modules
try:
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent / "Machine_understanding"))
    from delta.interaction.mouse_controller import PhysicsMouseController
    from delta.interaction.keyboard_controller import SmartKeyboardController
    from delta.interaction.window_manager import WindowManager
    HAS_DELTA = True
except Exception:
    HAS_DELTA = False

# Fallbacks
try:
    import pyautogui
    pyautogui.FAILSAFE = False
    HAS_PYAUTOGUI = True
except:
    HAS_PYAUTOGUI = False

class DesktopControl:
    def __init__(self):
        if HAS_DELTA:
            self.mouse = PhysicsMouseController()
            self.keyboard = SmartKeyboardController()
            self.window_mgr = WindowManager()
        else:
            self.mouse = None
            self.keyboard = None
            self.window_mgr = None

    async def click_at(self, x: int, y: int, smooth: bool = True):
        if HAS_DELTA and smooth:
            await self.mouse.move_to_and_click(x, y)
        elif HAS_PYAUTOGUI:
            pyautogui.moveTo(x, y, duration=0.3 if smooth else 0)
            pyautogui.click()
        else:
            subprocess.run(["xdotool", "mousemove", str(x), str(y), "click", "1"], check=False)

    async def type_text(self, text: str, delay: float = 0.05):
        if HAS_DELTA:
            await self.keyboard.type_text(text, delay)
        elif HAS_PYAUTOGUI:
            pyautogui.write(text, interval=delay)
        else:
            subprocess.run(["xdotool", "type", "--delay", str(int(delay*1000)), text], check=False)

    def open_app(self, app_name: str):
        """Launch common apps including multiple browsers"""
        apps = {
            "chrome": "google-chrome",
            "chromium": "chromium-browser",
            "opera": "opera",
            "firefox": "firefox",
            "code": "code",
            "vs code": "code",
            "terminal": "gnome-terminal",
            "konsole": "konsole",
            "nautilus": "nautilus",
            "files": "nautilus",
        }
        cmd = apps.get(app_name.lower().strip(), app_name)
        try:
            subprocess.Popen([cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except:
            subprocess.Popen(f"{cmd} & disown", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def focus_window(self, title_contains: str):
        """Focus window by title"""
        try:
            subprocess.run(["wmctrl", "-a", title_contains], check=False)
        except:
            pass

    def create_folder(self, path: str):
        Path(path).mkdir(parents=True, exist_ok=True)
        return f"Folder created: {path}"

    async def execute_natural_command(self, command: str) -> str:
        """High-level natural language desktop action"""
        cmd = command.lower()

        if "open chrome" in cmd:
            self.open_app("chrome")
            return "Opened Chrome"
        if "open code" in cmd or "open vs code" in cmd:
            self.open_app("code")
            return "Opened VS Code"
        if "create folder" in cmd or "make folder" in cmd:
            # extract name
            import re
            match = re.search(r"folder\s+([a-zA-Z0-9_ -]+)", cmd)
            name = match.group(1).strip() if match else "new_folder"
            path = str(Path.home() / "Documents" / name)
            return self.create_folder(path)
        if "focus" in cmd and "chrome" in cmd:
            self.focus_window("Chrome")
            return "Focused Chrome"
        return "Command understood but no direct desktop action matched. Delegating to Pro AGI brain."

# Singleton
_desktop_control = None

def get_desktop_control() -> DesktopControl:
    global _desktop_control
    if _desktop_control is None:
        _desktop_control = DesktopControl()
    return _desktop_control
