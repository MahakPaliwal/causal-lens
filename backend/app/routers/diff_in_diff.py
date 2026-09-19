from fastapi import APIRouter
from app.models.diff_in_diff import DiDRequest, DiDResponse
from app.services.diff_in_diff_service import run_diff_in_diff

router = APIRouter(prefix="/api/diff-in-diff", tags=["Difference-in-Differences"])

@router.post("/", response_model=DiDResponse)
def diff_in_diff(request: DiDRequest):
    data_dicts = [d.model_dump() for d in request.data]
    result = run_diff_in_diff(data_dicts)
    return result