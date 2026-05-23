"""
Letta (formerly MemGPT) Agent Integration — Phase 4
Persistent stateful agents with long-term memory and self-editing.

Letta agents:
  - Maintain their own memory across sessions
  - Can edit their own memory blocks
  - Support tool use and function calling
  - Human-like: remember users, learn preferences, adapt over time

Falls back to ensemble if Letta not available.
"""

import logging
import os
from typing import Optional

logger = logging.getLogger("ang.letta")

LETTA_BASE_URL = os.getenv("LETTA_BASE_URL", "http://localhost:8283")
LETTA_TOKEN    = os.getenv("LETTA_TOKEN", "")


def _get_letta_client():
    try:
        from letta import create_client
        if LETTA_TOKEN:
            from letta import RESTClient
            return RESTClient(base_url=LETTA_BASE_URL, token=LETTA_TOKEN)
        return create_client()  # local
    except ImportError:
        logger.warning("letta not installed — pip install letta")
        return None
    except Exception as exc:
        logger.warning("Letta client init failed: %s", exc)
        return None


class LettaAgentManager:
    """
    Manages a pool of Letta agents — one per user.
    Each agent has persistent memory and learns over time.
    """

    def __init__(self):
        self._client = _get_letta_client()
        self._agents: dict[str, str] = {}  # user_id → agent_id
        self._available = self._client is not None
        if self._available:
            logger.info("Letta agent manager active at %s", LETTA_BASE_URL)

    def _get_or_create_agent(self, user_id: str) -> Optional[str]:
        """Get existing agent for user or create a new one."""
        if user_id in self._agents:
            return self._agents[user_id]

        try:
            from letta.schemas.memory import ChatMemory
            from letta.schemas.llm_config import LLMConfig
            from letta.schemas.embedding_config import EmbeddingConfig

            agent_state = self._client.create_agent(
                name=f"ang_agent_{user_id}",
                memory=ChatMemory(
                    human=f"User ID: {user_id}. A user of the ANG AI system.",
                    persona=(
                        "I am ANG, an advanced AI assistant with persistent memory. "
                        "I remember past conversations and learn from interactions. "
                        "I think carefully before answering and always aim to be helpful, "
                        "accurate, and honest."
                    ),
                ),
                llm_config=LLMConfig(
                    model=os.getenv("LETTA_MODEL", "gpt-4o-mini"),
                    model_endpoint_type="openai",
                    model_endpoint=os.getenv("LETTA_LLM_ENDPOINT", "https://api.openai.com/v1"),
                    context_window=8192,
                ),
                embedding_config=EmbeddingConfig(
                    embedding_endpoint_type="huggingface",
                    embedding_model="sentence-transformers/all-MiniLM-L6-v2",
                    embedding_dim=384,
                    embedding_chunk_size=300,
                ),
            )
            agent_id = agent_state.id
            self._agents[user_id] = agent_id
            logger.info("Created Letta agent %s for user %s", agent_id, user_id)
            return agent_id
        except Exception as exc:
            logger.warning("Failed to create Letta agent: %s", exc)
            return None

    async def chat(self, user_id: str, message: str) -> dict:
        """Send message to user's persistent Letta agent."""
        if not self._available:
            return {"output": None, "source": "letta_unavailable"}

        agent_id = self._get_or_create_agent(user_id)
        if not agent_id:
            return {"output": None, "source": "letta_agent_failed"}

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self._client.send_message(
                    agent_id=agent_id,
                    message=message,
                    role="user",
                )
            )

            # Extract assistant message from response
            output = ""
            for msg in response.messages:
                if hasattr(msg, "assistant_message") and msg.assistant_message:
                    output = msg.assistant_message
                    break
                elif hasattr(msg, "function_return") and msg.function_return:
                    continue

            return {
                "output": output,
                "agent_id": agent_id,
                "source": "letta",
                "messages": len(response.messages),
            }
        except Exception as exc:
            logger.warning("Letta chat failed: %s", exc)
            return {"output": None, "source": "letta_error", "error": str(exc)}

    def get_agent_memory(self, user_id: str) -> dict:
        """Get current memory state of user's agent."""
        if not self._available:
            return {}
        agent_id = self._agents.get(user_id)
        if not agent_id:
            return {}
        try:
            memory = self._client.get_in_context_memory(agent_id=agent_id)
            return {
                "human": memory.get_block("human").value if memory.get_block("human") else "",
                "persona": memory.get_block("persona").value if memory.get_block("persona") else "",
            }
        except Exception as exc:
            logger.warning("get_agent_memory failed: %s", exc)
            return {}

    def list_agents(self) -> list[dict]:
        if not self._available:
            return []
        try:
            agents = self._client.list_agents()
            return [{"id": a.id, "name": a.name} for a in agents]
        except Exception:
            return []

    @property
    def available(self) -> bool:
        return self._available


# Singleton
_letta_manager: Optional[LettaAgentManager] = None

def get_letta() -> LettaAgentManager:
    global _letta_manager
    if _letta_manager is None:
        _letta_manager = LettaAgentManager()
    return _letta_manager
