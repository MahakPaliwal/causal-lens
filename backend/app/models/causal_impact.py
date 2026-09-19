from pydantic import BaseModel, Field
from datetime import date

class TimeSeriesPoint(BaseModel):
    date: date
    value: float
    control_value: float | None = Field(None, description="Optional: value of a correlated control series (e.g. a metric unaffected by the intervention) to improve the counterfactual model")

class CausalImpactRequest(BaseModel):
    data: list[TimeSeriesPoint]
    intervention_date: date = Field(..., description="The date the intervention/launch happened")

class CausalImpactResponse(BaseModel):
    actual_avg: float
    predicted_avg: float
    absolute_effect: float
    relative_effect_pct: float
    p_value: float
    is_significant: bool
    interpretation: str
    timeline: list[dict]  # NEW: day-by-day actual vs predicted, for charting