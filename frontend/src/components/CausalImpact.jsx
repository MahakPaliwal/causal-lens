import { useState } from "react";
import apiClient from "../api/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// Generate default 30-day series: 20 pre-period days (~100), 10 post-period days (~130)
import CsvUploader from "./CsvUploader";
import AiExplain from "./AiExplain";
const generateDefaultData = () => {
    const preValues = [100, 102, 98, 101, 103, 99, 100, 104, 97, 102, 101, 100, 103, 99, 102, 100, 101, 98, 103, 100];
    const postValues = [130, 128, 132, 129, 131, 130, 133, 128, 131, 130];
    const data = [];
    let day = 1;
    for (const v of preValues) {
        data.push({ date: `2024-01-${String(day).padStart(2, "0")}`, value: v });
        day++;
    }
    for (const v of postValues) {
        data.push({ date: `2024-01-${String(day).padStart(2, "0")}`, value: v });
        day++;
    }
    return data;
};

function CausalImpact() {
    const [interventionDate, setInterventionDate] = useState("2024-01-21");
    const [rawData, setRawData] = useState(generateDefaultData());
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await apiClient.post("/causal-impact/", {
                data: rawData,
                intervention_date: interventionDate,
            });
            setResult(response.data);
        } catch (err) {
            setError("Failed to run CausalImpact. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4">CausalImpact (Structural Time Series)</h2>
            <p className="text-sm text-gray-500 mb-4">
                Using a pre-loaded 30-day series (20 pre-period, 10 post-period days) with a known jump at the intervention date.
            </p>
            <CsvUploader
                fields={[
                    { key: "date", label: "Date column", hint: "A column with one date per row, in order (daily, weekly, etc.)." },
                    { key: "value", label: "Value/metric column", hint: "The metric you're tracking over time — e.g. daily sales, active users." },
                ]}
                onDataReady={(csvRows, mapping) => {
                    const mappedRows = csvRows
                        .map((r) => ({
                            date: String(r[mapping.date]),
                            value: Number(r[mapping.value]),
                        }))
                        .filter(r => !isNaN(r.value))
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    setRawData(mappedRows);
                }}
                onRemove={() => setRawData(generateDefaultData())}
            />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Intervention Date</label>
                    <input
                        type="date" value={interventionDate}
                        onChange={(e) => setInterventionDate(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50"
                >
                    {loading ? "Modeling counterfactual..." : "Run CausalImpact"}
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
                    <p className="text-slate-400 text-sm">🔮 Results will appear here</p>
                </div>
            )}
            {result && (
                <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-pink-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-extrabold text-pink-600">{result.absolute_effect.toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Absolute Effect</p>
                        </div>
                        <div className="bg-pink-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-extrabold text-pink-600">{result.relative_effect_pct.toFixed(1)}%</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Relative Effect</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-sm font-bold text-slate-700">{result.actual_avg.toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Actual Avg</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-sm font-bold text-slate-700">{result.predicted_avg.toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Predicted Avg</p>
                        </div>
                    </div>
                    <p className={`text-sm p-3 rounded-lg ${result.is_significant ? "bg-green-50 text-green-700 font-medium" : "bg-slate-50 text-slate-500"}`}>
                        {result.interpretation}
                    </p>

                    <div className="bg-white border border-gray-200 rounded-md p-4">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Actual vs. Predicted Counterfactual (Post-Period)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={result.timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} name="Actual" />
                                <Line type="monotone" dataKey="predicted" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" name="Predicted (counterfactual)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <AiExplain methodName="CausalImpact (Structural Time Series)" resultData={result} />
                </div>
            )}
        </div>
    );
}

export default CausalImpact;