import { useState } from "react";
import apiClient from "../api/client";
import AiExplain from "./AiExplain";
function SequentialTest() {
    const [visitorsA, setVisitorsA] = useState(1000);
    const [conversionsA, setConversionsA] = useState(100);
    const [visitorsB, setVisitorsB] = useState(1000);
    const [conversionsB, setConversionsB] = useState(130);
    const [mde, setMde] = useState(0.20);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await apiClient.post("/sequential-test/", {
                visitors_a: parseInt(visitorsA),
                conversions_a: parseInt(conversionsA),
                visitors_b: parseInt(visitorsB),
                conversions_b: parseInt(conversionsB),
                alpha: 0.05,
                beta: 0.20,
                minimum_detectable_effect: parseFloat(mde),
            });
            setResult(response.data);
        } catch (err) {
            setError("Failed to run test. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const decisionColor = {
        stop_b_wins: "text-green-600",
        stop_a_wins: "text-red-600",
        continue: "text-yellow-600",
    };

    const decisionLabel = {
        stop_b_wins: "Stop — B Wins",
        stop_a_wins: "Stop — A Wins",
        continue: "Continue Test",
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4">Sequential Testing (SPRT)</h2>
            <p className="text-sm text-gray-500 mb-4">Set MDE close to the effect size you expect — this is committed before the test starts.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1" >Visitors A</label>
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

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Minimum Detectable Effect (relative)</label>
                    <input
                        type="number" step="0.01" value={mde}
                        onChange={(e) => setMde(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? "Checking..." : "Check Sequential Test"}
                </button>
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
                    <p className="text-slate-400 text-sm">⏱️ Results will appear here</p>
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-3">
                    <div className={`rounded-xl p-4 text-center ${result.decision === "stop_b_wins" ? "bg-green-50" :
                        result.decision === "stop_a_wins" ? "bg-red-50" : "bg-yellow-50"
                        }`}>
                        <p className={`text-xl font-extrabold ${decisionColor[result.decision]}`}>
                            {decisionLabel[result.decision]}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm font-bold text-slate-700">{result.log_likelihood_ratio.toFixed(3)}</p>
                            <p className="text-xs text-slate-500 mt-1">LLR</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm font-bold text-slate-700">{result.upper_bound.toFixed(3)}</p>
                            <p className="text-xs text-slate-500 mt-1">Upper Bound</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm font-bold text-slate-700">{result.lower_bound.toFixed(3)}</p>
                            <p className="text-xs text-slate-500 mt-1">Lower Bound</p>
                        </div>
                    </div>
                    <AiExplain methodName="Sequential Testing (SPRT)" resultData={result} />
                </div>
            )}
        </div>
    );
}

export default SequentialTest;