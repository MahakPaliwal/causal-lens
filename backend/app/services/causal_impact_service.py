import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.structural import UnobservedComponents
from scipy import stats

def run_causal_impact(data: list[dict], intervention_date) -> dict:
    df = pd.DataFrame(data)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()

    intervention_date = pd.to_datetime(intervention_date)
    pre_df = df[df.index < intervention_date]
    post_df = df[df.index >= intervention_date]

    has_control = "control_value" in df.columns and df["control_value"].notna().all()

    if has_control:
        model = UnobservedComponents(
            pre_df["value"],
            level="local level",
            exog=pre_df["control_value"]
        )
    else:
        model = UnobservedComponents(
            pre_df["value"],
            level="local level"
        )

    fit_result = model.fit(disp=False)

    n_post = len(post_df)
    if has_control:
        forecast = fit_result.get_forecast(steps=n_post, exog=post_df["control_value"])
    else:
        forecast = fit_result.get_forecast(steps=n_post)

    predicted_mean = forecast.predicted_mean.values
    predicted_ci = forecast.conf_int(alpha=0.05)

    actual_values = post_df["value"].values
    pointwise_effect = actual_values - predicted_mean

    actual_avg = float(np.mean(actual_values))
    predicted_avg = float(np.mean(predicted_mean))
    absolute_effect = float(np.mean(pointwise_effect))
    relative_effect_pct = float((absolute_effect / predicted_avg) * 100) if predicted_avg != 0 else 0.0

    lower_bound = float(np.mean(predicted_ci.iloc[:, 0]))
    upper_bound = float(np.mean(predicted_ci.iloc[:, 1]))
    is_significant = actual_avg < lower_bound or actual_avg > upper_bound

    t_stat, p_value = stats.ttest_1samp(pointwise_effect, 0)
    p_value = float(p_value)

    direction = "increase" if absolute_effect > 0 else "decrease"
    if is_significant:
        interpretation = f"The intervention caused a statistically significant {direction} of {abs(absolute_effect):.2f} ({abs(relative_effect_pct):.1f}%) relative to the predicted counterfactual."
    else:
        interpretation = "No statistically significant causal effect was detected — the actual outcome falls within the expected range predicted from the pre-period trend."

    timeline = []
    for i, dt in enumerate(post_df.index):
        timeline.append({
            "date": dt.strftime("%Y-%m-%d"),
            "actual": float(actual_values[i]),
            "predicted": float(predicted_mean[i]),
        })

    return {
        "actual_avg": actual_avg,
        "predicted_avg": predicted_avg,
        "absolute_effect": absolute_effect,
        "relative_effect_pct": relative_effect_pct,
        "p_value": p_value,
        "is_significant": is_significant,
        "interpretation": interpretation,
        "timeline": timeline,
    }