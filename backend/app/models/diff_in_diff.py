from pydantic import BaseModel, Field

class DiDDataPoint(BaseModel):
    group: str = Field(..., description="'treatment' or 'control'")
    period: str = Field(..., description="'before' or 'after'")
    outcome: float = Field(..., description="The metric value, e.g. sales, conversion rate")

class DiDRequest(BaseModel):
    data: list[DiDDataPoint]

class DiDResponse(BaseModel):
    did_estimate: float
    p_value: float
    std_error: float
    is_significant: bool
    interpretation: str
    parallel_trends_warning: str | None = None