from fastapi import APIRouter
from app.models.bayesian_ab import BayesianABRequest, BayesianABResponse
from app.services.bayesian_ab_service import run_bayesian_ab_test

router = APIRouter(prefix="/api/bayesian-ab", tags=["Bayesian A/B Testing"])

@router.post("/", response_model=BayesianABResponse)
def bayesian_ab_test(request: BayesianABRequest):
    result = run_bayesian_ab_test(
        visitors_a=request.visitors_a,
        conversions_a=request.conversions_a,
        visitors_b=request.visitors_b,
        conversions_b=request.conversions_b,
    )
    return result