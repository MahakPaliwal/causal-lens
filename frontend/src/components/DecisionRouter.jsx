import { useState } from "react";

const QUESTIONS = {
    start: {
        question: "Was the treatment/intervention randomly assigned to users?",
        options: [
            { label: "Yes — we ran a proper randomized experiment", next: "ab_early_stop" },
            { label: "No — it was rolled out without randomization", next: "control_group" },
        ],
    },
    ab_early_stop: {
        question: "Do you want to check results while the test is still running (early stopping)?",
        options: [
            { label: "Yes — I want to check before reaching full sample size", next: null, result: "sequential" },
            { label: "No — the test has finished, analyze final results", next: null, result: "bayesian" },
        ],
    },
    control_group: {
        question: "Do you have a comparable control group observed over the same before/after period?",
        options: [
            { label: "Yes — I have before/after data for both a treated and an untreated group", next: null, result: "did" },
            { label: "No — there's no separate control group over time", next: "confounders" },
        ],
    },
    confounders: {
        question: "Can you identify observable characteristics that likely influenced who received treatment (e.g., past spend, tenure)?",
        options: [
            { label: "Yes — I can list relevant confounding variables", next: null, result: "psm" },
            { label: "No — I only have a single time series to analyze", next: null, result: "causal_impact" },
        ],
    },
};

const RESULTS = {
    sequential: {
        method: "Sequential Testing (SPRT)",
        tabLabel: "Sequential Test",
        groupLabel: "Experimentation Engine",
        reason: "Since treatment was randomized and you want to check results before the test finishes, SPRT lets you stop early without inflating your false-positive rate — unlike naively peeking at a running t-test.",
    },
    bayesian: {
        method: "Bayesian A/B Testing",
        tabLabel: "Bayesian A/B Test",
        groupLabel: "Experimentation Engine",
        reason: "With randomization and a completed test, Bayesian A/B testing gives you a direct probability that the treatment beats control, plus credible intervals — an intuitive alternative to p-values.",
    },
    did: {
        method: "Difference-in-Differences",
        tabLabel: "Diff-in-Diff",
        groupLabel: "Causal Impact Engine",
        reason: "Without randomization but with a comparable control group over the same time period, DiD isolates the treatment effect from any shared underlying trend both groups experience.",
    },
    psm: {
        method: "Propensity Score Matching",
        tabLabel: "Propensity Matching",
        groupLabel: "Causal Impact Engine",
        reason: "Without randomization or a natural control group, but with known confounders, PSM matches treated and untreated units with similar characteristics to estimate a fair causal effect.",
    },
    causal_impact: {
        method: "CausalImpact (Structural Time Series)",
        tabLabel: "Causal Impact",
        groupLabel: "Causal Impact Engine",
        reason: "With no control group at all and only a single time series, CausalImpact builds a statistical counterfactual from the pre-intervention trend to estimate what would have happened without the intervention.",
    },
};

function DecisionRouter({ onMethodSelected }) {
    const [currentStep, setCurrentStep] = useState("start");
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    const handleAnswer = (option) => {
        setHistory([...history, currentStep]);
        if (option.result) {
            setResult(option.result);
        } else {
            setCurrentStep(option.next);
        }
    };

    const handleRestart = () => {
        setCurrentStep("start");
        setResult(null);
        setHistory([]);
    };

    const handleGoBack = () => {
        const prev = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setCurrentStep(prev);
        setResult(null);
    };

    const current = QUESTIONS[currentStep];
    const resultData = result ? RESULTS[result] : null;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500"></div>

            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-extrabold text-slate-800">🧭 Which method should I use?</h2>
                {(history.length > 0 || result) && (
                    <button
                        onClick={handleRestart}
                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                    >
                        ↺ Start over
                    </button>
                )}
            </div>

            {!result && (
                <div className="flex gap-1.5 mb-6">
                    {[0, 1, 2].map((step) => (
                        <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${step <= history.length ? "bg-indigo-500" : "bg-slate-100"
                                }`}
                        ></div>
                    ))}
                </div>
            )}

            {!resultData && current && (
                <div>
                    <p className="text-slate-700 font-medium mb-4">{current.question}</p>
                    <div className="space-y-2">
                        {current.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                className="w-full text-left px-5 py-4 rounded-xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all text-sm font-medium text-slate-700 flex items-center justify-between group"
                            >
                                <span>{opt.label}</span>
                                <span className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">→</span>
                            </button>
                        ))}
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={handleGoBack}
                            className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg mt-4 transition"
                        >
                            ← Back
                        </button>
                    )}
                </div>
            )}

            {resultData && (
                <div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-4">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">Recommended Method</p>
                        <p className="text-2xl font-extrabold text-slate-800">{resultData.method}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-5">{resultData.reason}</p>
                    <button
                        onClick={() => onMethodSelected(resultData.groupLabel, resultData.tabLabel)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                        Take me to this tool →
                    </button>
                </div>
            )}
        </div>
    );
}

export default DecisionRouter;