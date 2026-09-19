from pydantic import BaseModel, Field
from typing import Literal

class SequentialTestRequest(BaseModel):
    visitors_a: int = Field(..., gt=0)
    conversions_a: int = Field(..., ge=0)
    visitors_b: int = Field(..., gt=0)
    conversions_b: int = Field(..., ge=0)
    alpha: float = Field(0.05, gt=0, lt=1, description="False positive rate tolerance")
    beta: float = Field(0.20, gt=0, lt=1, description="False negative rate tolerance")
    minimum_detectable_effect: float = Field(..., gt=0, description="Relative effect you want to be able to detect, e.g. 0.10 for 10% relative lift")

class SequentialTestResponse(BaseModel):
    decision: Literal["stop_b_wins", "stop_a_wins", "continue"]
    log_likelihood_ratio: float
    upper_bound: float
    lower_bound: float