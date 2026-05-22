from pydantic import BaseModel

class InferRequest(BaseModel):
    input: str
    latency_budget_ms: int = 200
    runtime_hint: str | None = None
