import { useState } from "react";
import apiClient from "../api/client";
import CsvUploader from "./CsvUploader";
import AiExplain from "./AiExplain";
const defaultRecords = [
    { treatment: 1, outcome: 150, past_spend: 100, tenure_months: 12 },
    { treatment: 1, outcome: 160, past_spend: 110, tenure_months: 14 },
    { treatment: 1, outcome: 140, past_spend: 90, tenure_months: 10 },
    { treatment: 1, outcome: 170, past_spend: 120, tenure_months: 16 },
    { treatment: 0, outcome: 90, past_spend: 50, tenure_months: 5 },
    { treatment: 0, outcome: 95, past_spend: 55, tenure_months: 6 },
    { treatment: 0, outcome: 130, past_spend: 95, tenure_months: 11 },
    { treatment: 0, outcome: 145, past_spend: 115, tenure_months: 15 },
    { treatment: 0, outcome: 120, past_spend: 85, tenure_months: 9 },
    { treatment: 0, outcome: 100, past_spend: 60, tenure_months: 7 },
];

function PSM() {
    const [rows, setRows] = useState(defaultRecords);
    const [caliper, setCaliper] = useState(0.3);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRowChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = parseFloat(value);
        setRows(updated);
    };

    const addRow = () => {
        setRows([...rows, { treatment: 0, outcome: 0, past_spend: 0, tenure_months: 0 }]);
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
            const records = rows.map((r) => ({
                treatment: r.treatment,
                outcome: r.outcome,
                covariates: {
                    past_spend: r.past_spend,
                    tenure_months: r.tenure_months,
                },
            }));

            const response = await apiClient.post("/psm/", {
                records,
                caliper: parseFloat(caliper),
            });
            setResult(response.data);
        } catch (err) {
            setError("Failed to run PSM. Check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-2 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-2">Propensity Score Matching</h2>
            <p className="text-xs text-slate-400 mb-4">Treatment = 1 means that row received the change; 0 means it didn't. Add any traits (covariates) that might explain who got treated.</p>
            <CsvUploader
                treatmentIsCategorical={true}
                fields={[
                    { key: "treatment", label: "Treatment/Offer column", hint: "..." },
                    { key: "outcome", label: "Outcome column", hint: "..." },
                    { key: "covariate1", label: "Covariate 1", hint: "..." },
                    { key: "covariate2", label: "Covariate 2", hint: "..." },
                ]}
                onDataReady={(csvRows, mapping, treatmentValue) => {
                    const mappedRows = csvRows.map((r) => ({
                        treatment: String(r[mapping.treatment]) === String(treatmentValue) ? 1 : 0,
                        outcome: Number(r[mapping.outcome]),
                        past_spend: Number(r[mapping.covariate1]),
                        tenure_months: Number(r[mapping.covariate2]),
                    })).filter(r => !isNaN(r.outcome));

                    setRows(mappedRows);
                }}
                onRemove={() => setRows(defaultRecords)}
            />
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-2">
                    <div className="grid grid-cols-5 gap-1 text-xs font-medium text-gray-500 px-1">
                        <span>Treatment</span>
                        <span>Outcome</span>
                        <span>Past Spend</span>
                        <span>Tenure</span>
                        <span></span>
                    </div>
                    {rows.map((row, index) => (
                        <div key={index} className="grid grid-cols-5 gap-1 items-center">
                            <select
                                value={row.treatment}
                                onChange={(e) => handleRowChange(index, "treatment", e.target.value)}
                                className="border border-gray-300 rounded-md p-1"
                            >
                                <option value={1}>1</option>
                                <option value={0}>0</option>
                            </select>
                            <input
                                type="number" value={row.outcome}
                                onChange={(e) => handleRowChange(index, "outcome", e.target.value)}
                                className="border border-gray-300 rounded-md p-1"
                            />
                            <input
                                type="number" value={row.past_spend}
                                onChange={(e) => handleRowChange(index, "past_spend", e.target.value)}
                                className="border border-gray-300 rounded-md p-1"
                            />
                            <input
                                type="number" value={row.tenure_months}
                                onChange={(e) => handleRowChange(index, "tenure_months", e.target.value)}
                                className="border border-gray-300 rounded-md p-1"
                            />
                            <button type="button" onClick={() => removeRow(index)} className="text-red-500">✕</button>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addRow} className="text-blue-600 text-sm">+ Add row</button>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Caliper</label>
                    <input
                        type="number" step="0.01" value={caliper}
                        onChange={(e) => setCaliper(e.target.value)}
                        className="mt-1 block w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Matching..." : "Run PSM"}
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
                    <p className="text-slate-400 text-sm">🔗 Results will appear here</p>
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-extrabold text-indigo-600">{result.att_estimate.toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">ATT Estimate</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-extrabold text-slate-700">{result.n_matched_pairs}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Matched Pairs</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-extrabold text-slate-700">{result.n_treated_unmatched}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Unmatched</p>
                        </div>
                    </div>
                    <p className="text-sm p-3 rounded-lg bg-slate-50 text-slate-600">{result.interpretation}</p>

                    {result.covariate_balance && result.covariate_balance.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 mt-3">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Covariate Balance: Before vs. After Matching</h3>
                            <p className="text-xs text-slate-400 mb-3">Treated and control means should be much closer in the "After" columns — that's evidence the matching worked.</p>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left border-b border-slate-100">
                                        <th className="pb-2 font-semibold text-slate-500">Covariate</th>
                                        <th className="pb-2 font-semibold text-slate-500">Before (Treated)</th>
                                        <th className="pb-2 font-semibold text-slate-500">Before (Control)</th>
                                        <th className="pb-2 font-semibold text-slate-500">After (Treated)</th>
                                        <th className="pb-2 font-semibold text-slate-500">After (Control)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.covariate_balance.map((row, i) => {
                                        const beforeGap = Math.abs(row.before_treated_mean - row.before_control_mean);
                                        const afterGap = Math.abs(row.after_treated_mean - row.after_control_mean);
                                        const improved = afterGap < beforeGap;
                                        return (
                                            <tr key={i} className="border-b border-slate-50 last:border-0">
                                                <td className="py-1.5 font-medium text-slate-600">{row.covariate}</td>
                                                <td className="py-1.5 text-slate-500">{row.before_treated_mean.toFixed(2)}</td>
                                                <td className="py-1.5 text-slate-500">{row.before_control_mean.toFixed(2)}</td>
                                                <td className={`py-1.5 font-semibold ${improved ? "text-green-600" : "text-slate-500"}`}>{row.after_treated_mean.toFixed(2)}</td>
                                                <td className={`py-1.5 font-semibold ${improved ? "text-green-600" : "text-slate-500"}`}>{row.after_control_mean.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <AiExplain methodName="Propensity Score Matching" resultData={result} />
                </div>
            )}
        </div>
    );
}

export default PSM;