import { useState } from "react";
import apiClient from "../api/client";
import CsvUploader from "./CsvUploader";
import AiExplain from "./AiExplain";
const defaultData = [
    { group: "treatment", period: "before", outcome: 100 },
    { group: "treatment", period: "before", outcome: 102 },
    { group: "treatment", period: "before", outcome: 98 },
    { group: "treatment", period: "after", outcome: 130 },
    { group: "treatment", period: "after", outcome: 128 },
    { group: "treatment", period: "after", outcome: 132 },
    { group: "control", period: "before", outcome: 100 },
    { group: "control", period: "before", outcome: 101 },
    { group: "control", period: "before", outcome: 99 },
    { group: "control", period: "after", outcome: 105 },
    { group: "control", period: "after", outcome: 106 },
    { group: "control", period: "after", outcome: 104 },
];

function DiffInDiff() {
    const [rows, setRows] = useState(defaultData);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRowChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = field === "outcome" ? parseFloat(value) : value;
        setRows(updated);
    };

    const addRow = () => {
        setRows([...rows, { group: "treatment", period: "before", outcome: 0 }]);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await apiClient.post("/diff-in-diff/", { data: rows });
            setResult(response.data);
        } catch (err) {
            setError("Failed to run DiD. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-2">Difference-in-Differences</h2>
            <p className="text-xs text-slate-400 mb-4">"Treatment" = the group that got the change. "Control" = the group that didn't. Enter values from before and after the change for both.</p>
            <CsvUploader
                fields={[
                    { key: "group", label: "Group column (treatment/control)", hint: "Column labeling which rows are the treated group and which are the control group (e.g. 'store_type', 'region')." },
                    { key: "period", label: "Period column (before/after)", hint: "Column labeling whether each row is from before or after the change happened (e.g. 'month', 'phase')." },
                    { key: "outcome", label: "Outcome column", hint: "The metric you're measuring — e.g. sales, signups, revenue." },
                ]}
                onDataReady={(csvRows, mapping) => {
                    const mappedRows = csvRows.map((r) => ({
                        group: String(r[mapping.group]),
                        period: String(r[mapping.period]),
                        outcome: Number(r[mapping.outcome]),
                    })).filter(r => !isNaN(r.outcome));

                    setRows(mappedRows);
                }}
                onRemove={() => setRows(defaultData)}
            />
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-2">
                    {rows.map((row, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <select
                                value={row.group}
                                onChange={(e) => handleRowChange(index, "group", e.target.value)}
                                className="border border-gray-300 rounded-md p-2"
                            >
                                <option value="treatment">treatment</option>
                                <option value="control">control</option>
                            </select>
                            <select
                                value={row.period}
                                onChange={(e) => handleRowChange(index, "period", e.target.value)}
                                className="border border-gray-300 rounded-md p-2"
                            >
                                <option value="before">before</option>
                                <option value="after">after</option>
                            </select>
                            <input
                                type="number" value={row.outcome}
                                onChange={(e) => handleRowChange(index, "outcome", e.target.value)}
                                className="w-24 border border-gray-300 rounded-md p-2"
                            />
                            <button type="button" onClick={() => removeRow(index)} className="text-red-500 px-2">✕</button>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addRow} className="text-blue-600 text-sm">+ Add row</button>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 mt-2"
                    >
                        {loading ? "Running..." : "Run DiD Analysis"}
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
                    <p className="text-slate-400 text-sm">📈 Results will appear here</p>
                </div>
            )}
            {result && (
                <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-teal-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-extrabold text-teal-600">{result.did_estimate.toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">DiD Estimate</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-sm font-bold text-slate-700">{result.p_value.toExponential(2)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">P-value</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-sm font-bold text-slate-700">{result.std_error.toFixed(3)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Std Error</p>
                        </div>
                    </div>
                    <p className={`text-sm p-3 rounded-lg ${result.is_significant ? "bg-green-50 text-green-700 font-medium" : "bg-slate-50 text-slate-500"}`}>
                        {result.interpretation}
                    </p>
                    {result.parallel_trends_warning && (
                        <p className="text-sm p-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            ⚠️ {result.parallel_trends_warning}
                        </p>
                    )}
                    <AiExplain methodName="Difference-in-Differences" resultData={result} />
                </div>
            )}
        </div>
    );
}

export default DiffInDiff;