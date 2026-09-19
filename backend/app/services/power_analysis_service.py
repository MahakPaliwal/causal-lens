from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
import math

def calculate_sample_size(baseline_rate: float, mde: float, power: float, alpha: float) -> dict:
    expected_rate = baseline_rate + mde

    effect_size = proportion_effectsize(baseline_rate, expected_rate)

    analysis = NormalIndPower()
    n_per_group = analysis.solve_power(
        effect_size=effect_size,
        power=power,
        alpha=alpha,
        ratio=1.0,
        alternative="two-sided"
    )

    n_per_group = math.ceil(n_per_group)

    return {
        "required_sample_size_per_group": n_per_group,
        "total_sample_size": n_per_group * 2,
        "baseline_rate": baseline_rate,
        "expected_rate": expected_rate,
    }