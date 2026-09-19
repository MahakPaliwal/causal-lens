import pandas as pd
import statsmodels.formula.api as smf

def run_diff_in_diff(data: list[dict]) -> dict:
    df = pd.DataFrame(data)

    # Create binary indicators required for the DiD regression
    df["treatment_group"] = (df["group"] == "treatment").astype(int)
    df["after_period"] = (df["period"] == "after").astype(int)
    parallel_trends_warning = None
    pre_treatment = df[(df["treatment_group"] == 1) & (df["after_period"] == 0)]["outcome"]
    pre_control = df[(df["treatment_group"] == 0) & (df["after_period"] == 0)]["outcome"]

    if len(pre_treatment) >= 2 and len(pre_control) >= 2:
        pre_treatment_mean = pre_treatment.mean()
        pre_control_mean = pre_control.mean()
        pre_treatment_std = pre_treatment.std()
        pre_control_std = pre_control.std()

        # Simple heuristic: flag if pre-period means differ by more than
        # 1.5x the pooled standard deviation, suggesting groups weren't
        # comparable even before treatment.
        pooled_std = ((pre_treatment_std ** 2 + pre_control_std ** 2) / 2) ** 0.5
        if pooled_std > 0:
            standardized_gap = abs(pre_treatment_mean - pre_control_mean) / pooled_std
            if standardized_gap > 1.5:
                parallel_trends_warning = (
                    f"Warning: treatment and control groups had noticeably different pre-period averages "
                    f"({pre_treatment_mean:.2f} vs {pre_control_mean:.2f}). This may violate the 'parallel trends' "
                    f"assumption DiD relies on — interpret the estimate with caution."
                )
    else:
        parallel_trends_warning = (
            "Not enough pre-period observations per group to check the parallel trends assumption. "
            "Add more 'before' data points for a more reliable DiD estimate."
        )
    # DiD regression: outcome ~ treatment + after + treatment*after
    # The interaction term's coefficient IS the causal DiD estimate
    model = smf.ols(
        "outcome ~ treatment_group * after_period",
        data=df
    ).fit()

    interaction_term = "treatment_group:after_period"
    did_estimate = model.params[interaction_term]
    p_value = model.pvalues[interaction_term]
    std_error = model.bse[interaction_term]

    is_significant = p_value < 0.05

    if is_significant:
       direction_word = "increase" if did_estimate > 0 else "decrease"
       interpretation = f"The treatment caused a statistically significant {direction_word} of {abs(did_estimate):.4f} in the outcome, beyond what the control group's natural trend would predict." 
    else:
        interpretation = "No statistically significant causal effect was detected at the 5% level."

    return {
        "did_estimate": float(did_estimate),
        "p_value": float(p_value),
        "std_error": float(std_error),
        "is_significant": is_significant,
        "interpretation": interpretation,
        "parallel_trends_warning": parallel_trends_warning,
    }