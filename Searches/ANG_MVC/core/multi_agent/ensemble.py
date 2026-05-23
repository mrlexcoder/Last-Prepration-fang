"""
ANG Multi-Agent Ensemble — Phase 4
Runs N agents in parallel, each with different reasoning strategies.
Votes on best answer using confidence + semantic similarity.

Agents:
  - DirectAgent:    fast, direct answer
  - ChainAgent:     step-by-step chain-of-thought
  - CriticAgent:    generates then self-critiques
  - SearchAgent:    retrieves memory context first
  - SynthAgent:     synthesizes all other outputs

Final answer = weighted vote across all agents.
"""

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger("ang.ensemble")


@dataclass
class AgentResult:
    agent_id: str
    output: str
    confidence: float
    reasoning: str
    latency_ms: float
    strategy: str


@dataclass
class EnsembleResult:
    final_output: str
    final_confidence: float
    winner: str
    all_results: list[AgentResult]
    consensus_score: float  # 0-1, how much agents agreed
    latency_ms: float


# ─── Individual Agents ────────────────────────────────────────────────────────

async def _run_direct_agent(prompt: str, infer_fn, runtime_hint: str) -> AgentResult:
    """Fast direct answer — no extra reasoning."""
    t0 = time.perf_counter()
    result = await infer_fn(prompt, runtime_hint=runtime_hint)
    return AgentResult(
        agent_id="direct",
        output=result.get("output", ""),
        confidence=result.get("confidence", 0.5),
        reasoning="direct inference",
        latency_ms=(time.perf_counter() - t0) * 1000,
        strategy="direct",
    )


async def _run_chain_agent(prompt: str, infer_fn, runtime_hint: str) -> AgentResult:
    """Chain-of-thought: think step by step."""
    t0 = time.perf_counter()
    cot_prompt = (
        f"Think step by step to answer this question.\n"
        f"Show your reasoning, then give a final answer.\n\n"
        f"Question: {prompt}\n\nReasoning:"
    )
    result = await infer_fn(cot_prompt, runtime_hint=runtime_hint)
    raw = result.get("output", "")

    # Extract final answer after reasoning
    final = raw
    if "Final answer:" in raw:
        final = raw.split("Final answer:")[-1].strip()
    elif "\n\n" in raw:
        parts = raw.strip().split("\n\n")
        final = parts[-1] if len(parts) > 1 else raw

    return AgentResult(
        agent_id="chain",
        output=final,
        confidence=min(result.get("confidence", 0.5) * 1.1, 1.0),  # CoT gets slight boost
        reasoning=raw[:200],
        latency_ms=(time.perf_counter() - t0) * 1000,
        strategy="chain_of_thought",
    )


async def _run_critic_agent(prompt: str, infer_fn, runtime_hint: str) -> AgentResult:
    """Generate answer, then self-critique and refine."""
    t0 = time.perf_counter()

    # Step 1: initial answer
    r1 = await infer_fn(prompt, runtime_hint=runtime_hint)
    draft = r1.get("output", "")

    # Step 2: critique
    critique_prompt = (
        f"Original question: {prompt}\n\n"
        f"Draft answer: {draft}\n\n"
        f"Critique this answer. Is it accurate, complete, and clear? "
        f"Then provide an improved final answer."
    )
    r2 = await infer_fn(critique_prompt, runtime_hint=runtime_hint)
    refined = r2.get("output", draft)

    # Extract improved answer
    if "improved" in refined.lower() or "final answer" in refined.lower():
        for marker in ["Improved answer:", "Final answer:", "Better answer:"]:
            if marker in refined:
                refined = refined.split(marker)[-1].strip()
                break

    avg_conf = (r1.get("confidence", 0.5) + r2.get("confidence", 0.5)) / 2
    return AgentResult(
        agent_id="critic",
        output=refined,
        confidence=min(avg_conf * 1.05, 1.0),
        reasoning=f"draft→critique→refine",
        latency_ms=(time.perf_counter() - t0) * 1000,
        strategy="self_critique",
    )


async def _run_memory_agent(prompt: str, infer_fn, runtime_hint: str,
                            user_id: Optional[str] = None) -> AgentResult:
    """Retrieves relevant memory context before answering."""
    t0 = time.perf_counter()

    context = ""
    try:
        from core.mem0_layer import get_mem0
        mem = get_mem0()
        context = mem.build_context_prompt(prompt, user_id=user_id or "default")
    except Exception:
        pass

    enriched_prompt = context + prompt if context else prompt
    result = await infer_fn(enriched_prompt, runtime_hint=runtime_hint)

    return AgentResult(
        agent_id="memory",
        output=result.get("output", ""),
        confidence=result.get("confidence", 0.5) * (1.1 if context else 1.0),
        reasoning=f"memory_context={'yes' if context else 'no'}",
        latency_ms=(time.perf_counter() - t0) * 1000,
        strategy="memory_augmented",
    )


async def _run_synth_agent(prompt: str, drafts: list[str], infer_fn, runtime_hint: str) -> AgentResult:
    """Synthesizes outputs from other agents into best final answer."""
    t0 = time.perf_counter()

    if not drafts:
        return await _run_direct_agent(prompt, infer_fn, runtime_hint)

    synth_prompt = (
        f"Question: {prompt}\n\n"
        f"Here are {len(drafts)} different answers from different reasoning approaches:\n\n"
        + "\n\n".join(f"Answer {i+1}: {d}" for i, d in enumerate(drafts[:3]))
        + "\n\nSynthesize the best, most accurate and complete answer from these:"
    )
    result = await infer_fn(synth_prompt, runtime_hint=runtime_hint)

    return AgentResult(
        agent_id="synth",
        output=result.get("output", ""),
        confidence=min(result.get("confidence", 0.5) * 1.15, 1.0),
        reasoning="synthesis of multiple agents",
        latency_ms=(time.perf_counter() - t0) * 1000,
        strategy="synthesis",
    )


# ─── Voting / Consensus ───────────────────────────────────────────────────────

def _semantic_similarity(a: str, b: str) -> float:
    """Simple token overlap similarity (fast, no model needed)."""
    if not a or not b:
        return 0.0
    tokens_a = set(a.lower().split())
    tokens_b = set(b.lower().split())
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    return len(intersection) / len(union)


def _vote(results: list[AgentResult]) -> tuple[AgentResult, float]:
    """
    Weighted voting:
      - Each agent votes for the most similar other agent
      - Weight = confidence * similarity_score
      - Winner = highest total vote weight
    """
    if not results:
        raise ValueError("No agent results to vote on")
    if len(results) == 1:
        return results[0], 1.0

    scores = {r.agent_id: 0.0 for r in results}

    for r in results:
        for other in results:
            if r.agent_id == other.agent_id:
                continue
            sim = _semantic_similarity(r.output, other.output)
            # Vote weight: my confidence * similarity to other
            scores[other.agent_id] += r.confidence * sim

    # Add own confidence
    for r in results:
        scores[r.agent_id] += r.confidence * 0.5

    winner_id = max(scores, key=lambda k: scores[k])
    winner = next(r for r in results if r.agent_id == winner_id)

    # Consensus = average pairwise similarity
    pairs = 0
    total_sim = 0.0
    for i, r in enumerate(results):
        for j, other in enumerate(results):
            if i < j:
                total_sim += _semantic_similarity(r.output, other.output)
                pairs += 1
    consensus = total_sim / pairs if pairs > 0 else 1.0

    return winner, consensus


# ─── Ensemble Orchestrator ────────────────────────────────────────────────────

class MultiAgentEnsemble:
    """
    Runs multiple agents in parallel and returns the best answer.
    Human-like: thinks from multiple angles, then picks the best.
    """

    def __init__(self, infer_fn, num_agents: int = 4):
        self.infer_fn = infer_fn
        self.num_agents = min(num_agents, 5)

    async def run(self, prompt: str, runtime_hint: Optional[str] = None,
                  user_id: Optional[str] = None, fast_mode: bool = False) -> EnsembleResult:
        t0 = time.perf_counter()

        if fast_mode or self.num_agents <= 1:
            # Single agent — just direct
            r = await _run_direct_agent(prompt, self.infer_fn, runtime_hint)
            return EnsembleResult(
                final_output=r.output,
                final_confidence=r.confidence,
                winner="direct",
                all_results=[r],
                consensus_score=1.0,
                latency_ms=(time.perf_counter() - t0) * 1000,
            )

        # Run first N-1 agents in parallel
        tasks = [
            _run_direct_agent(prompt, self.infer_fn, runtime_hint),
            _run_chain_agent(prompt, self.infer_fn, runtime_hint),
        ]
        if self.num_agents >= 3:
            tasks.append(_run_memory_agent(prompt, self.infer_fn, runtime_hint, user_id))
        if self.num_agents >= 4:
            tasks.append(_run_critic_agent(prompt, self.infer_fn, runtime_hint))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        valid = [r for r in results if isinstance(r, AgentResult)]

        if not valid:
            logger.error("All agents failed")
            return EnsembleResult("", 0.0, "none", [], 0.0, 0.0)

        # Optionally run synth agent on top of others
        if self.num_agents >= 5 and len(valid) >= 2:
            drafts = [r.output for r in valid[:3]]
            synth = await _run_synth_agent(prompt, drafts, self.infer_fn, runtime_hint)
            valid.append(synth)

        winner, consensus = _vote(valid)

        # Record thought traces
        try:
            from core.storage_client import get_storage
            storage = get_storage()
            for r in valid:
                storage.record_thought(r.agent_id, r.output[:200], r.confidence)
        except Exception:
            pass

        total_ms = (time.perf_counter() - t0) * 1000
        logger.info(
            "ensemble: %d agents, winner=%s conf=%.2f consensus=%.2f latency=%.0fms",
            len(valid), winner.agent_id, winner.confidence, consensus, total_ms
        )

        return EnsembleResult(
            final_output=winner.output,
            final_confidence=winner.confidence,
            winner=winner.agent_id,
            all_results=valid,
            consensus_score=consensus,
            latency_ms=total_ms,
        )
