import pandas as pd
import json
import os

def load_and_prepare():
    df = pd.read_csv("data/hillstrom.csv")

    # Keep only Discount vs No Offer -- cleanest, strongest, most interpretable effect
    df = df[df["offer"].isin(["Discount", "No Offer"])].copy()
    df["treatment"] = (df["offer"] == "Discount").astype(int)

    return df

def build_bayesian_ab_payload(df):
    """Aggregate counts for the clean randomized A/B test."""
    treated = df[df["treatment"] == 1]
    control = df[df["treatment"] == 0]

    payload = {
        "visitors_a": len(control),
        "conversions_a": int(control["conversion"].sum()),
        "visitors_b": len(treated),
        "conversions_b": int(treated["conversion"].sum()),
    }
    return payload

def build_confounded_psm_payload(df, n_sample=500):
    """
    Deliberately break randomization: only keep treated customers
    with ABOVE-median history (spend), simulating a real-world
    scenario where a discount was only ever sent to higher-value customers.
    Control group stays as the full random sample.
    This creates confounding, since history also affects conversion.
    """
    median_history = df["history"].median()

    treated_confounded = df[(df["treatment"] == 1) & (df["history"] > median_history)]
    control_all = df[df["treatment"] == 0]

    # Sample down to keep the payload small enough to send via API comfortably
    treated_sample = treated_confounded.sample(n=min(n_sample, len(treated_confounded)), random_state=42)
    control_sample = control_all.sample(n=min(n_sample, len(control_all)), random_state=42)

    records = []
    for _, row in pd.concat([treated_sample, control_sample]).iterrows():
        records.append({
            "treatment": int(row["treatment"]),
            "outcome": float(row["conversion"]),
            "covariates": {
                "recency": float(row["recency"]),
                "history": float(row["history"]),
                "is_referral": float(row["is_referral"]),
            }
        })

    return {"records": records, "caliper": 0.1}

if __name__ == "__main__":
    os.makedirs("data/prepared", exist_ok=True)
    df = load_and_prepare()

    bayesian_payload = build_bayesian_ab_payload(df)
    with open("data/prepared/hillstrom_bayesian_ab.json", "w") as f:
        json.dump(bayesian_payload, f, indent=2)
    print("Bayesian A/B payload:", bayesian_payload)

    psm_payload = build_confounded_psm_payload(df)
    with open("data/prepared/hillstrom_psm_confounded.json", "w") as f:
        json.dump(psm_payload, f, indent=2)
    print(f"PSM payload created with {len(psm_payload['records'])} records")