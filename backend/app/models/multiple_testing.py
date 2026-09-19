from pydantic import BaseModel, Field

class MetricResult(BaseModel):
    metric_name: str
    p_value: float = Field(..., ge=0, le=1)

class MultipleTestingRequest(BaseModel):
    metrics: list[MetricResult]
    alpha: float = Field(0.05, gt=0, lt=1, description="Desired false discovery rate")

class CorrectedMetricResult(BaseModel):
    metric_name: str
    p_value: float
    adjusted_p_value: float
    significant: bool

class MultipleTestingResponse(BaseModel):
    results: list[CorrectedMetricResult]