from pydantic import BaseModel, Field


class LoopRequest(BaseModel):
    input: str
    max_iterations: int = Field(default=3, ge=1, le=10)
    confidence_threshold: float = Field(default=0.85, ge=0.0, le=1.0)
    runtime_hint: str | None = None
