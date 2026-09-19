import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.causal_impact_service import run_causal_impact
from datetime import date

def test_causal_impact_recovers_true_effect():
    """
    Simulated 30-day series with a KNOWN true intervention effect of ~+30,
    starting 2024-01-21.
    """
    pre_values = [100, 102, 98, 101, 103, 99, 100, 104, 97, 102,
                  101, 100, 103, 99, 102, 100, 101, 98, 103, 100]
    post_values = [130, 128, 132, 129, 131, 130, 133, 128, 131, 130]

    data = []
    day = 1
    for v in pre_values:
        data.append({"date": f"2024-01-{day:02d}", "value": v})
        day += 1
    for v in post_values:
        data.append({"date": f"2024-01-{day:02d}", "value": v})
        day += 1

    result = run_causal_impact(data, date(2024, 1, 21))

    true_effect = 30.0
    tolerance = 3.0

    assert abs(result["absolute_effect"] - true_effect) < tolerance, \
        f"Expected effect near {true_effect}, got {result['absolute_effect']}"
    assert result["is_significant"] == True