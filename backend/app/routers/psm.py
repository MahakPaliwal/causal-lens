from fastapi import APIRouter
from app.models.psm import PSMRequest, PSMResponse
from app.services.psm_service import run_psm

router = APIRouter(prefix="/api/psm", tags=["Propensity Score Matching"])

@router.post("/", response_model=PSMResponse)
def propensity_score_matching(request: PSMRequest):
    records_dicts = [r.model_dump() for r in request.records]
    result = run_psm(records_dicts, request.caliper)
    return result