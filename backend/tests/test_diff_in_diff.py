import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.diff_in_diff_service import run_diff_in_diff

def test_did_recovers_true_effect():
    """
    Simulated data with a KNOWN true causal effect of +25.
    Treatment jumps from ~100 to ~130 (+30), control drifts from ~100 to ~105 (+5).
    True DiD effect = 30 - 5 = 25.
    """
    data = [
        {"group": "treatment", "period": "before", "outcome": 100},
        {"group": "treatment", "period": "before", "outcome": 102},
        {"group": "treatment", "period": "before", "outcome": 98},
        {"group": "treatment", "period": "after", "outcome": 130},
        {"group": "treatment", "period": "after", "outcome": 128},
        {"group": "treatment", "period": "after", "outcome": 132},
        {"group": "control", "period": "before", "outcome": 100},
        {"group": "control", "period": "before", "outcome": 101},
        {"group": "control", "period": "before", "outcome": 99},
        {"group": "control", "period": "after", "outcome": 105},
        {"group": "control", "period": "after", "outcome": 106},
        {"group": "control", "period": "after", "outcome": 104},
    ]

    result = run_diff_in_diff(data)

    true_effect = 25.0
    tolerance = 1.0  # allow small floating point/model variance

    assert abs(result["did_estimate"] - true_effect) < tolerance, \
        f"Expected DiD estimate near {true_effect}, got {result['did_estimate']}"
    assert result["is_significant"] == True