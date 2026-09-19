import math

def run_sprt(
    visitors_a: int, conversions_a: int,
    visitors_b: int, conversions_b: int,
    alpha: float, beta: float, minimum_detectable_effect: float
) -> dict:
    p_a = conversions_a / visitors_a  # baseline rate estimated from control

    # Null hypothesis: rate is p_a. Alternative: rate is p_a * (1 + mde)
    p0 = p_a
    p1 = p_a * (1 + minimum_detectable_effect)

    # Clip to avoid log(0) issues
    p0 = min(max(p0, 1e-6), 1 - 1e-6)
    p1 = min(max(p1, 1e-6), 1 - 1e-6)

    # SPRT decision boundaries (Wald's approach)
    upper_bound = math.log((1 - beta) / alpha)
    lower_bound = math.log(beta / (1 - alpha))

    # Log-likelihood ratio for group B's observed data under H1 vs H0
    successes = conversions_b
    failures = visitors_b - conversions_b

    llr = (
        successes * math.log(p1 / p0) +
        failures * math.log((1 - p1) / (1 - p0))
    )

    if llr >= upper_bound:
        decision = "stop_b_wins"
    elif llr <= lower_bound:
        decision = "stop_a_wins"
    else:
        decision = "continue"

    return {
        "decision": decision,
        "log_likelihood_ratio": llr,
        "upper_bound": upper_bound,
        "lower_bound": lower_bound,
    }