from fastapi import APIRouter
from app.models.causal_impact import CausalImpactRequest, CausalImpactResponse
from app.services.causal_impact_service import run_causal_impact

router = APIRouter(prefix="/api/causal-impact", tags=["CausalImpact"])

@router.post("/", response_model=CausalImpactResponse)
def causal_impact(request: CausalImpactRequest):
    data_dicts = [d.model_dump() for d in request.data]
    result = run_causal_impact(data_dicts, request.intervention_date)
    return result