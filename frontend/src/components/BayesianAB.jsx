import { useState } from "react";
import apiClient from "../api/client";
import AiExplain from "./AiExplain";
function BayesianAB() {
    const [visitorsA, setVisitorsA] = useState(1000);
    const [conversionsA, setConversionsA] = useState(100);
    const [visitorsB, setVisitorsB] = useState(1000);
    const [conversionsB, setConversionsB] = useState(130);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await apiClient.post("/bayesian-ab/", {
                visitors_a: parseInt(visitorsA),
                conversions_a: parseInt(conversionsA),
                visitors_b: parseInt(visitorsB),
                conversions_b: parseInt(conversionsB),
            });
            setResult(response.data);
        } catch (err) {
            setError("Failed to run test. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4">Bayesian A/B Test</h2>
            <p className="text-sm text-gray-500 mb-4">Note: sampling can take 10-30 seconds on first run.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Visitors A</label>
                        <input
                            type="number" value={visitorsA}
                            onChange={(e) => setVisitorsA(e.target.value)}
                            className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Conversions A</label>
                        <input
                            type="number" value={conversionsA}
                            onChange={(e) => setConversionsA(e.target.value)}
                            className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Visitors B</label>
                        <input
                            type="number" value={visitorsB}
                            onChange={(e) => setVisitorsB(e.target.value)}
                            className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Conversions B</label>
                        <input
                            type="number" value={conversionsB}
                            onChange={(e) => setConversionsB(e.target.value)}
                            className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? "Sampling posterior..." : "Run Bayesian A/B Test"}
                </button>
            </form>

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {loading && (
                <div className="mt-6 border border-indigo-100 bg-indigo-50 rounded-xl p-6 text-center">
                    <div className="inline-block w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
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
                <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-green-600">{(result.prob_b_beats_a * 100).toFixed(1)}%</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">P(B beats A)</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-green-600">{(result.expected_lift * 100).toFixed(1)}%</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Expected Lift</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="font-semibold text-slate-700 mb-1">95% CI — A</p>
                            <p>[{result.credible_interval_a[0].toFixed(4)}, {result.credible_interval_a[1].toFixed(4)}]</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="font-semibold text-slate-700 mb-1">95% CI — B</p>
                            <p>[{result.credible_interval_b[0].toFixed(4)}, {result.credible_interval_b[1].toFixed(4)}]</p>
                        </div>
                    </div>
                    <AiExplain methodName="Bayesian A/B Testing" resultData={result} />
                </div>
            )}
        </div>
    );
}

export default BayesianAB;