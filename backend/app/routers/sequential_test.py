from fastapi import APIRouter
from app.models.sequential_test import SequentialTestRequest, SequentialTestResponse
from app.services.sequential_test_service import run_sprt

router = APIRouter(prefix="/api/sequential-test", tags=["Sequential Testing"])

@router.post("/", response_model=SequentialTestResponse)
def sequential_test(request: SequentialTestRequest):
    result = run_sprt(
        visitors_a=request.visitors_a,
        conversions_a=request.conversions_a,
        visitors_b=request.visitors_b,
        conversions_b=request.conversions_b,
        alpha=request.alpha,
        beta=request.beta,
        minimum_detectable_effect=request.minimum_detectable_effect,
    )
    return result