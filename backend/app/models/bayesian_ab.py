from pydantic import BaseModel, Field

class BayesianABRequest(BaseModel):
    visitors_a: int = Field(..., gt=0, description="Number of visitors in control group A")
    conversions_a: int = Field(..., ge=0, description="Number of conversions in group A")
    visitors_b: int = Field(..., gt=0, description="Number of visitors in treatment group B")
    conversions_b: int = Field(..., ge=0, description="Number of conversions in group B")

class BayesianABResponse(BaseModel):
    prob_b_beats_a: float
    expected_lift: float
    credible_interval_a: list[float]
    credible_interval_b: list[float]