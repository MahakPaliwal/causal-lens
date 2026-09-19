import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors

def run_psm(records: list[dict], caliper: float) -> dict:
    df = pd.DataFrame(records)

    covariates_df = pd.json_normalize(df["covariates"])
    df = pd.concat([df.drop(columns=["covariates"]), covariates_df], axis=1)

    covariate_cols = covariates_df.columns.tolist()

    X = df[covariate_cols].values
    y = df["treatment"].values

    # Step 1: Estimate propensity scores via logistic regression
    model = LogisticRegression()
    model.fit(X, y)
    df["propensity_score"] = model.predict_proba(X)[:, 1]

    treated = df[df["treatment"] == 1].reset_index(drop=True)
    control = df[df["treatment"] == 0].reset_index(drop=True)

    # Step 2: Nearest-neighbor matching on propensity score, within caliper
    nn = NearestNeighbors(n_neighbors=1)
    nn.fit(control[["propensity_score"]].values)

    distances, indices = nn.kneighbors(treated[["propensity_score"]].values)
    matched_treated_outcomes = []
    matched_control_outcomes = []
    matched_treated_indices = []
    matched_control_indices = []
    unmatched_count = 0

    for i, (dist, idx) in enumerate(zip(distances.flatten(), indices.flatten())):
        if dist <= caliper:
            matched_treated_outcomes.append(treated.loc[i, "outcome"])
            matched_control_outcomes.append(control.loc[idx, "outcome"])
            matched_treated_indices.append(i)
            matched_control_indices.append(idx)
        else:
            unmatched_count += 1

    if len(matched_treated_outcomes) == 0:
        return {
            "att_estimate": 0.0,
            "n_matched_pairs": 0,
            "n_treated_unmatched": unmatched_count,
            "interpretation": "No valid matches found within the specified caliper. Try increasing the caliper value.",
        }

    att_estimate = float(np.mean(matched_treated_outcomes) - np.mean(matched_control_outcomes))

    interpretation = (
        f"After matching {len(matched_treated_outcomes)} treated units to similar control units "
        f"based on covariates, the estimated causal effect (ATT) is {att_estimate:.4f}. "
        f"{unmatched_count} treated units could not be matched within the caliper."
    )
    covariate_balance = []
    for col in covariate_cols:
        before_treated_mean = float(treated[col].mean())
        before_control_mean = float(control[col].mean())

        if len(matched_treated_indices) > 0:
            after_treated_mean = float(treated.loc[matched_treated_indices, col].mean())
            after_control_mean = float(control.loc[matched_control_indices, col].mean())
        else:
            after_treated_mean = before_treated_mean
            after_control_mean = before_control_mean

        covariate_balance.append({
            "covariate": col,
            "before_treated_mean": before_treated_mean,
            "before_control_mean": before_control_mean,
            "after_treated_mean": after_treated_mean,
            "after_control_mean": after_control_mean,
        })

    return {
        "att_estimate": att_estimate,
        "n_matched_pairs": len(matched_treated_outcomes),
        "n_treated_unmatched": unmatched_count,
        "interpretation": interpretation,
        "covariate_balance": covariate_balance,
    }