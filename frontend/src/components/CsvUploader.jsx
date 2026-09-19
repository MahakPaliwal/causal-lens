import { useState } from "react";
import Papa from "papaparse";

const MAX_ROWS = 1000;

function CsvUploader({ fields, onDataReady, onRemove, treatmentIsCategorical = false }) {
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [mapping, setMapping] = useState({});
    const [treatmentValue, setTreatmentValue] = useState("");
    const [uniqueTreatmentValues, setUniqueTreatmentValues] = useState([]);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState(null);
    const [wasTrimmed, setWasTrimmed] = useState(false);
    const handleRemoveFile = () => {
        setHeaders([]);
        setRows([]);
        setMapping({});
        setTreatmentValue("");
        setUniqueTreatmentValues([]);
        setFileName("");
        setError(null);
        setWasTrimmed(false);
        if (onRemove) onRemove();
    };
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setError(null);
        setWasTrimmed(false);

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (!results.data.length) {
                    setError("CSV appears empty or invalid.");
                    return;
                }

                let data = results.data;
                if (data.length > MAX_ROWS) {
                    // Random sample for a representative subset instead of just the first N
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    data = shuffled.slice(0, MAX_ROWS);
                    setWasTrimmed(true);
                }

                setHeaders(results.meta.fields);
                setRows(data);
            },
            error: () => setError("Failed to parse CSV."),
        });
    };

    const handleMappingChange = (fieldKey, column) => {
        setMapping((prev) => ({ ...prev, [fieldKey]: column }));

        if (fieldKey === "treatment" && treatmentIsCategorical && column) {
            const uniqueVals = [...new Set(rows.map((r) => r[column]))].filter(v => v !== null && v !== undefined && v !== "");
            setUniqueTreatmentValues(uniqueVals);
            setTreatmentValue("");
        }
    };

    const requiredFieldsMapped = fields.every((f) => mapping[f.key]);
    const allMapped = treatmentIsCategorical
        ? requiredFieldsMapped && treatmentValue !== ""
        : requiredFieldsMapped;

    const handleConfirm = () => {
        onDataReady(rows, mapping, treatmentValue);
    };
    

    return (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Upload your own CSV (optional)
            </label>
            <input
                type="file" accept=".csv"
                onChange={handleFile}
                className="text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-sm file:font-medium hover:file:bg-indigo-700 cursor-pointer"
            />
            {fileName && (
                <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-slate-500">
                        Loaded: {fileName} ({rows.length} rows{wasTrimmed ? `, randomly sampled from a larger file` : ""})
                    </p>
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                    >
                        Remove
                    </button>
                </div>
            )}
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

            {headers.length > 0 && (
                <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-600">Map your columns:</p>
                    {fields.map((f) => (
                        <div key={f.key} className="pb-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 w-48">{f.label}</span>
                                <select
                                    value={mapping[f.key] || ""}
                                    onChange={(e) => handleMappingChange(f.key, e.target.value)}
                                    className="flex-1 border border-slate-200 rounded-lg p-2 text-sm"
                                >
                                    <option value="">-- select column --</option>
                                    {headers.map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                            {f.hint && <p className="text-xs text-slate-400 mt-1 ml-0 pl-0">{f.hint}</p>}
                        </div>
                    ))}

                    {treatmentIsCategorical && uniqueTreatmentValues.length > 0 && (
                        <div className="pb-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 w-48">Which value = "treated"?</span>
                                <select
                                    value={treatmentValue}
                                    onChange={(e) => setTreatmentValue(e.target.value)}
                                    className="flex-1 border border-slate-200 rounded-lg p-2 text-sm"
                                >
                                    <option value="">-- select value --</option>
                                    {uniqueTreatmentValues.map((v) => (
                                        <option key={v} value={v}>{String(v)}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">The "treatment" group is whoever received the change you're testing (e.g. saw the new feature, got the discount). Everyone else is "control".</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!allMapped}
                        className="mt-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40"
                    >
                        Use This Data
                    </button>
                </div>
            )}
        </div>
    );
}

export default CsvUploader;