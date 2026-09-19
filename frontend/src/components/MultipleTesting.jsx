import { useState } from "react";
import apiClient from "../api/client";
import AiExplain from "./AiExplain";
function MultipleTesting() {
    const [metrics, setMetrics] = useState([
        { metric_name: "conversion_rate", p_value: 0.01 },
        { metric_name: "revenue_per_user", p_value: 0.04 },
        { metric_name: "retention_7day", p_value: 0.03 },
        { metric_name: "click_through_rate", p_value: 0.20 },
        { metric_name: "signup_rate", p_value: 0.045 },
    ]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleMetricChange = (index, field, value) => {
        const updated = [...metrics];
        updated[index][field] = field === "p_value" ? parseFloat(value) : value;
        setMetrics(updated);
    };

    const addMetric = () => {
        setMetrics([...metrics, { metric_name: "", p_value: 0.05 }]);
    };

    const removeMetric = (index) => {
        setMetrics(metrics.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await apiClient.post("/multiple-testing/", {
                metrics: metrics,
                alpha: 0.05,
            });
            setResult(response.data);
        } catch (err) {
            setError("Failed to run correction. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4">Multiple-Testing Correction (Benjamini-Hochberg)</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                {metrics.map((m, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            type="text" placeholder="Metric name" value={m.metric_name}
                            onChange={(e) => handleMetricChange(index, "metric_name", e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md p-2"
                        />
                        <input
                            type="number" step="0.001" placeholder="p-value" value={m.p_value}
                            onChange={(e) => handleMetricChange(index, "p_value", e.target.value)}
                            className="w-28 border border-gray-300 rounded-md p-2"
                        />
                        <button type="button" onClick={() => removeMetric(index)} className="text-red-500 px-2">✕</button>
                    </div>
                ))}

                <button type="button" onClick={addMetric} className="text-blue-600 text-sm">+ Add metric</button>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 mt-2"
                    >
                        {loading ? "Correcting..." : "Apply Correction"}
                    </button>
                </div>
            </form>

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {loading && (
                <div className="mt-6 border border-indigo-100 bg-indigo-50 rounded-xl p-6 text-center">
                    <div className="inline-block w-6 h-6 border-3 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-indigo-600 font-medium">Sampling posterior distribution...</p>
                    <p className="text-xs text-slate-400 mt-1">This can take 10-30 seconds on the first run.</p>
                </div>
            )}

            {!result && !loading && (
                <div className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-slate-400 text-sm">🎲 Results will appear here</p>
                </div>
            )}

            {result && (
                <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="pb-2">Metric</th>
                                <th className="pb-2">Raw p</th>
                                <th className="pb-2">Adjusted p</th>
                                <th className="pb-2">Significant?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.results.map((r, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-1">{r.metric_name}</td>
                                    <td className="py-1">{r.p_value.toFixed(4)}</td>
                                    <td className="py-1">{r.adjusted_p_value.toFixed(4)}</td>
                                    <td className="py-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.significant ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
                                            }`}>
                                            {r.significant ? "Significant" : "Not Significant"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <AiExplain methodName="Multiple Testing Correction (Benjamini-Hochberg)" resultData={result} />
                </div>
            )}
        </div>
    );
}

export default MultipleTesting;