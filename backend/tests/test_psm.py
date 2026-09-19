import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.psm_service import run_psm

def test_psm_recovers_true_effect():
    """
    Simulated data with a KNOWN true treatment effect of +20,
    where treatment assignment is confounded with past_spend/tenure.
    """
    records = [
        {"treatment": 1, "outcome": 150, "covariates": {"past_spend": 100, "tenure_months": 12}},
        {"treatment": 1, "outcome": 160, "covariates": {"past_spend": 110, "tenure_months": 14}},
        {"treatment": 1, "outcome": 140, "covariates": {"past_spend": 90, "tenure_months": 10}},
        {"treatment": 1, "outcome": 170, "covariates": {"past_spend": 120, "tenure_months": 16}},
        {"treatment": 0, "outcome": 90, "covariates": {"past_spend": 50, "tenure_months": 5}},
        {"treatment": 0, "outcome": 95, "covariates": {"past_spend": 55, "tenure_months": 6}},
        {"treatment": 0, "outcome": 130, "covariates": {"past_spend": 95, "tenure_months": 11}},
        {"treatment": 0, "outcome": 145, "covariates": {"past_spend": 115, "tenure_months": 15}},
        {"treatment": 0, "outcome": 120, "covariates": {"past_spend": 85, "tenure_months": 9}},
        {"treatment": 0, "outcome": 100, "covariates": {"past_spend": 60, "tenure_months": 7}},
    ]

    result = run_psm(records, caliper=0.3)

    true_effect = 20.0
    tolerance = 2.0

    assert abs(result["att_estimate"] - true_effect) < tolerance, \
        f"Expected ATT near {true_effect}, got {result['att_estimate']}"
    assert result["n_matched_pairs"] > 0