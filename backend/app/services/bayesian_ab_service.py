import pymc as pm
import numpy as np

def run_bayesian_ab_test(visitors_a: int, conversions_a: int, visitors_b: int, conversions_b: int) -> dict:
    with pm.Model():
        # Uninformative Beta(1,1) priors on conversion rate for each group
        p_a = pm.Beta("p_a", alpha=1, beta=1)
        p_b = pm.Beta("p_b", alpha=1, beta=1)

        pm.Binomial("obs_a", n=visitors_a, p=p_a, observed=conversions_a)
        pm.Binomial("obs_b", n=visitors_b, p=p_b, observed=conversions_b)

        trace = pm.sample(2000, tune=1000, chains=2, progressbar=False, random_seed=42)

    p_a_samples = trace.posterior["p_a"].values.flatten()
    p_b_samples = trace.posterior["p_b"].values.flatten()

    prob_b_beats_a = float(np.mean(p_b_samples > p_a_samples))
    expected_lift = float(np.mean((p_b_samples - p_a_samples) / p_a_samples))

    ci_a = [float(np.percentile(p_a_samples, 2.5)), float(np.percentile(p_a_samples, 97.5))]
    ci_b = [float(np.percentile(p_b_samples, 2.5)), float(np.percentile(p_b_samples, 97.5))]

    return {
        "prob_b_beats_a": prob_b_beats_a,
        "expected_lift": expected_lift,
        "credible_interval_a": ci_a,
        "credible_interval_b": ci_b,
    }