import { useState } from "react";
import apiClient from "../api/client";
import AiExplain from "./AiExplain";

function PowerAnalysis() {
    const [baselineRate, setBaselineRate] = useState(0.10);
    const [mde, setMde] = useState(0.02);
    const [power, setPower] = useState(0.8);
    const [alpha, setAlpha] = useState(0.05);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await apiClient.post("/power-analysis/", {
                baseline_rate: parseFloat(baselineRate),
                minimum_detectable_effect: parseFloat(mde),
                power: parseFloat(power),
                alpha: parseFloat(alpha),
            });
            setResult(response.data);
        } catch (err) {
            setError("Failed to calculate. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4">Power Analysis / Sample Size Calculator</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Baseline Conversion Rate</label>
                    <input
                        type="number" step="0.01" value={baselineRate}
                        onChange={(e) => setBaselineRate(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Minimum Detectable Effect</label>
                    <input
                        type="number" step="0.01" value={mde}
                        onChange={(e) => setMde(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Power</label>
                    <input
                        type="number" step="0.01" value={power}
                        onChange={(e) => setPower(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Alpha (Significance Level)</label>
                    <input
                        type="number" step="0.01" value={alpha}
                        onChange={(e) => setAlpha(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Calculating..." : "Calculate Sample Size"}
                </button>
            </form>

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {!result && !loading && (
                <div className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-slate-400 text-sm">📊 Results will appear here</p>
                </div>
            )}

            {result && (
                <>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-indigo-600">{result.required_sample_size_per_group}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Per Group</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-indigo-600">{result.total_sample_size}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Total Sample</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-indigo-600">{(result.expected_rate * 100).toFixed(1)}%</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Expected Rate</p>
                        </div>
                    </div>
                    <AiExplain methodName="Power Analysis / Sample Size Calculation" resultData={result} />
                </>
            )}
        </div>
    );
}

export default PowerAnalysis;