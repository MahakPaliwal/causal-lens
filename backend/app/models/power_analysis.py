from pydantic import BaseModel, Field

class PowerAnalysisRequest(BaseModel):
    baseline_rate: float = Field(..., gt=0, lt=1, description="Current conversion rate, e.g. 0.10 for 10%")
    minimum_detectable_effect: float = Field(..., gt=0, description="Absolute effect size to detect, e.g. 0.02 for a 2pp lift")
    power: float = Field(0.8, gt=0, lt=1, description="Statistical power, default 0.8")
    alpha: float = Field(0.05, gt=0, lt=1, description="Significance level, default 0.05")

class PowerAnalysisResponse(BaseModel):
    required_sample_size_per_group: int
    total_sample_size: int
    baseline_rate: float
    expected_rate: float