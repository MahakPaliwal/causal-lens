from fastapi import APIRouter
from app.models.multiple_testing import MultipleTestingRequest, MultipleTestingResponse
from app.services.multiple_testing_service import apply_bh_correction

router = APIRouter(prefix="/api/multiple-testing", tags=["Multiple Testing Correction"])

@router.post("/", response_model=MultipleTestingResponse)
def correct_multiple_tests(request: MultipleTestingRequest):
    metrics_dicts = [m.model_dump() for m in request.metrics]
    corrected = apply_bh_correction(metrics_dicts, request.alpha)
    return {"results": corrected}