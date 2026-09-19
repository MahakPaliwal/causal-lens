from pydantic import BaseModel, Field

class PSMRecord(BaseModel):
    treatment: int = Field(..., description="1 if treated, 0 if control")
    outcome: float = Field(..., description="The outcome metric, e.g. spend, conversion")
    covariates: dict[str, float] = Field(..., description="Confounding variables, e.g. {'past_spend': 120.5, 'tenure_months': 8}")

class PSMRequest(BaseModel):
    records: list[PSMRecord]
    caliper: float = Field(0.05, gt=0, description="Max allowed propensity score distance for a valid match")

class CovariateBalance(BaseModel):
    covariate: str
    before_treated_mean: float
    before_control_mean: float
    after_treated_mean: float
    after_control_mean: float

class PSMResponse(BaseModel):
    att_estimate: float
    n_matched_pairs: int
    n_treated_unmatched: int
    interpretation: str
    covariate_balance: list[CovariateBalance] = []