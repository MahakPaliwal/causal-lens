from fastapi import APIRouter
from app.models.power_analysis import PowerAnalysisRequest, PowerAnalysisResponse
from app.services.power_analysis_service import calculate_sample_size

router = APIRouter(prefix="/api/power-analysis", tags=["Power Analysis"])

@router.post("/", response_model=PowerAnalysisResponse)
def get_sample_size(request: PowerAnalysisRequest):
    result = calculate_sample_size(
        baseline_rate=request.baseline_rate,
        mde=request.minimum_detectable_effect,
        power=request.power,
        alpha=request.alpha,
    )
    return result