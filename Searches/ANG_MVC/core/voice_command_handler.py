"""
VoiceCommandHandler v4.344 — Pro-level real-time voice to action system for Linux desktop

This turns natural spoken commands into real actions on the Linux machine:
- "make a folder called myproject in Documents"
- "open Chrome"
- "open the folder /home/user/test"
- "what processes are running"
- "focus VS Code"
- "open browser and go to github.com"

It uses the full ProAGIMaster god tools + Delta interaction + LaptopObserver for full control.
"""

import re
import os
import subprocess
from typing import Dict, Any
from pathlib import Path

from core.laptop_observer import get_laptop_observer
from core.desktop_control import get_desktop_control

class VoiceCommandHandler:
    def __init__(self, tools):
        self.tools = tools
        self.observer = get_laptop_observer()
        self.desktop = get_desktop_control()

    async def handle(self, command: str) -> Dict[str, Any]:
        """Main entry — understands and executes voice command."""
        cmd = command.lower().strip()
        response = {"executed": False, "action": None, "result": "", "spoken_response": ""}

        # Special wake word handling - pro partner style
        if cmd.startswith("hey ang") or cmd == "hey ang":
            state = self.observer.get_full_laptop_state()
            response.update({
                "executed": True,
                "action": "wake_up",
                "spoken_response": f"Hey, I'm here. {state.get('summary', 'Watching your desktop.')} What do you need me to do?"
            })
            return response

        # === Folder operations ===
        if any(x in cmd for x in ["make folder", "create folder", "new folder", "mkdir"]):
            # Robust extraction
            folder_name = "new_project"
            words = cmd.split()
            for i, w in enumerate(words):
                if w in ["folder", "directory"] and i + 1 < len(words):
                    folder_name = words[i+1].replace("called", "").strip()
                    break
            path = Path.home() / "Documents" / folder_name
            self.tools.run_command(f"mkdir -p '{path}'")
            response.update({
                "executed": True,
                "action": "create_folder",
                "result": f"Created {path}",
                "spoken_response": f"Folder {folder_name} created successfully in Documents."
            })

        elif "open folder" in cmd or "open the folder" in cmd:
            match = re.search(r"(?:folder|directory)\s+([/a-zA-Z0-9_\- .]+)", cmd)
            target = match.group(1).strip() if match else str(Path.home() / "Documents")
            self.tools.run_command(f"xdg-open '{target}'")
            response.update({
                "executed": True,
                "action": "open_folder",
                "result": f"Opened {target}",
                "spoken_response": f"Opening the folder {target}."
            })

        # === Browser / Chrome ===
        elif any(x in cmd for x in ["open chrome", "open browser", "launch chrome", "start chrome"]):
            self.tools.run_command("google-chrome & disown")
            response.update({
                "executed": True,
                "action": "open_chrome",
                "result": "Chrome launched",
                "spoken_response": "Opening Google Chrome for you."
            })

        elif "go to" in cmd or "open website" in cmd:
            match = re.search(r"(?:go to|open)\s+([a-zA-Z0-9.-]+)", cmd)
            url = match.group(1) if match else "google.com"
            if not url.startswith("http"):
                url = "https://" + url
            self.tools.run_command(f"google-chrome '{url}' & disown")
            response.update({
                "executed": True,
                "action": "open_website",
                "result": f"Opened {url} in Chrome",
                "spoken_response": f"Opening {url} in the browser."
            })

        # === VS Code ===
        elif "open vs code" in cmd or "open vscode" in cmd or "open code" in cmd:
            self.tools.run_command("code & disown")
            response.update({
                "executed": True,
                "action": "open_vscode",
                "result": "VS Code launched",
                "spoken_response": "Opening Visual Studio Code."
            })

        # === System understanding ===
        elif "what processes" in cmd or "what is running" in cmd or "laptop state" in cmd:
            state = self.observer.get_full_laptop_state()
            response.update({
                "executed": True,
                "action": "describe_laptop",
                "result": state["summary"],
                "spoken_response": state["summary"]
            })

        # === Strong desktop action parsing for human-like control ===
        import re

        if any(x in cmd for x in ["open opera", "launch opera", "start opera", "open the opera"]):
            # Try multiple ways to launch Opera on Linux
            result = self.tools.run_command("which opera && opera & disown || which google-chrome && google-chrome https://opera.com & disown || xdg-open 'https://www.opera.com' & disown || echo 'No Opera found, opened in default browser'")
            response.update({"executed": True, "action": "open_opera", "spoken_response": "Opening Opera browser for you right now."})

        elif any(x in cmd for x in ["open chrome", "launch chrome", "start chrome"]):
            self.tools.run_command("google-chrome & disown || chromium & disown")
            response.update({"executed": True, "action": "open_chrome", "spoken_response": "Opening Google Chrome."})

        elif any(x in cmd for x in ["open firefox", "launch firefox"]):
            self.tools.run_command("firefox & disown")
            response.update({"executed": True, "action": "open_firefox", "spoken_response": "Opening Firefox."})

        elif any(x in cmd for x in ["make folder", "create folder", "new folder", "mkdir"]):
            match = re.search(r"(?:folder|directory)\s+([a-zA-Z0-9_\- ]+)", cmd)
            name = match.group(1).strip() if match else "new_folder"
            path = str(Path.home() / "Documents" / name)
            self.tools.run_command(f"mkdir -p '{path}'")
            response.update({"executed": True, "action": "create_folder", "spoken_response": f"Folder '{name}' created in Documents."})

        elif any(x in cmd for x in ["focus vs code", "open vs code", "focus code", "bring up vs code"]):
            self.tools.run_command("wmctrl -a 'Visual Studio Code' || code & disown")
            response.update({"executed": True, "action": "focus_vscode", "spoken_response": "Focusing Visual Studio Code."})

        elif "focus chrome" in cmd:
            self.tools.run_command("wmctrl -a 'Google Chrome' || wmctrl -a 'Chromium'")
            response.update({"executed": True, "action": "focus_chrome", "spoken_response": "Focusing Chrome."})

        elif "what are you doing" in cmd or "what is happening" in cmd or "what are you working on" in cmd:
            state = self.observer.get_full_laptop_state()
            response.update({"executed": True, "action": "current_state", "spoken_response": state.get("summary", "I am monitoring your desktop and ready to help.")})

        elif any(phrase in cmd for phrase in ["open terminal", "new terminal", "launch terminal"]):
            # Support "open a terminal and run htop" etc. — real execution
            if "htop" in cmd or "top" in cmd:
                cmd_to_run = "gnome-terminal -- htop & disown || x-terminal-emulator -e htop & disown || konsole -e htop & disown || xterm -e htop & disown || echo 'Launched htop in best available terminal'"
                self.tools.run_command(cmd_to_run)
                response.update({"executed": True, "action": "open_terminal_htop", "spoken_response": "Opening a terminal and running htop for you right now."})
            else:
                self.tools.run_command("gnome-terminal & disown || x-terminal-emulator & disown || konsole & disown")
                response.update({"executed": True, "action": "open_terminal", "spoken_response": "Opening a new terminal for you."})

        elif "run htop" in cmd or "start htop" in cmd:
            # If they want htop in current terminal or new one
            self.tools.run_command("gnome-terminal -- htop & disown || htop & disown || echo 'Trying to launch htop in background'")
            response.update({"executed": True, "action": "run_htop", "spoken_response": "Launching htop in a new terminal."})

        # Desktop control
        elif "click" in cmd and any(y in cmd for y in ["at", "position", "here"]):
            nums = re.findall(r'\d+', cmd)
            if len(nums) >= 2:
                await self.desktop.click_at(int(nums[0]), int(nums[1]))
                response.update({"executed": True, "action": "mouse_click", "spoken_response": f"Clicked at {nums[0]}, {nums[1]}."})

        elif "type " in cmd or cmd.startswith("write "):
            text = cmd.split("type ", 1)[-1] if "type " in cmd else cmd.split("write ", 1)[-1]
            await self.desktop.type_text(text)
            response.update({"executed": True, "action": "type_text", "spoken_response": f"Typing: {text}"})

        # === Fallback to full Pro brain for complex or creative requests ===
        else:
            master_response = await self.tools.master.communicate(command) if hasattr(self.tools, 'master') else None
            response.update({
                "executed": True,
                "action": "pro_brain",
                "spoken_response": master_response.get("output", "Understood. Acting with full system access.") if isinstance(master_response, dict) else str(master_response or "Processing with full god-mode capabilities.")
            })

        return response

# Global instance
_voice_handler = None

def get_voice_handler(tools=None):
    global _voice_handler
    if _voice_handler is None and tools:
        _voice_handler = VoiceCommandHandler(tools)
    return _voice_handler
