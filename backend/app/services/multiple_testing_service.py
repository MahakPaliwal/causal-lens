from statsmodels.stats.multitest import multipletests

def apply_bh_correction(metrics: list[dict], alpha: float) -> list[dict]:
    names = [m["metric_name"] for m in metrics]
    p_values = [m["p_value"] for m in metrics]

    reject, adjusted_p_values, _, _ = multipletests(p_values, alpha=alpha, method="fdr_bh")

    results = []
    for name, raw_p, adj_p, is_sig in zip(names, p_values, adjusted_p_values, reject):
        results.append({
            "metric_name": name,
            "p_value": raw_p,
            "adjusted_p_value": float(adj_p),
            "significant": bool(is_sig),
        })

    return results