import { useState } from "react";
import Tabs from "./components/Tabs";
import DecisionRouter from "./components/DecisionRouter";
import PowerAnalysis from "./components/PowerAnalysis";
import BayesianAB from "./components/BayesianAB";
import SequentialTest from "./components/SequentialTest";
import MultipleTesting from "./components/MultipleTesting";
import DiffInDiff from "./components/DiffInDiff";
import PSM from "./components/PSM";
import CausalImpact from "./components/CausalImpact";

function App() {
  const groups = [
    {
      label: "Experimentation Engine",
      icon: "🧪",
      gradient: "from-indigo-600 to-blue-600",
      tabs: [
        { label: "Power Analysis", component: <PowerAnalysis /> },
        { label: "Bayesian A/B Test", component: <BayesianAB /> },
        { label: "Sequential Test", component: <SequentialTest /> },
        { label: "Multiple Testing", component: <MultipleTesting /> },
      ],
    },
    {
      label: "Causal Impact Engine",
      icon: "📈",
      gradient: "from-fuchsia-600 to-pink-600",
      tabs: [
        { label: "Diff-in-Diff", component: <DiffInDiff /> },
        { label: "Propensity Matching", component: <PSM /> },
        { label: "Causal Impact", component: <CausalImpact /> },
      ],
    },
  ];

  const [view, setView] = useState("finder"); // "finder" | "tools"
  const [forcedSelection, setForcedSelection] = useState(null);

  const handleMethodSelected = (groupLabel, tabLabel) => {
    const groupIndex = groups.findIndex((g) => g.label === groupLabel);
    const tabIndex = groups[groupIndex].tabs.findIndex((t) => t.label === tabLabel);
    setForcedSelection({ groupIndex, tabIndex, key: Date.now() });
    setView("tools");
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] bg-[length:24px_24px]">
      {/* Sticky top nav */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-slate-800 text-lg">
            📊 CausalLens<span className="hidden sm:inline text-slate-400 font-medium text-sm ml-2">| An Experimentation & Causal Impact Analysis Platform</span>
          </span>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1.5">
            <button
              onClick={() => setView("finder")}
              className={`px-5 py-2.5 rounded-lg text-base font-semibold transition ${view === "finder" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              🧭 Method Finder
            </button>
            <button
              onClick={() => setView("tools")}
              className={`px-5 py-2.5 rounded-lg text-base font-semibold transition ${view === "tools" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              🛠️ All Tools
            </button>
          </div>
        </div>
      </div>

      {/* Hero — only on Method Finder view */}
      {view === "finder" && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 border-b border-slate-200 py-14 mb-8">
          <div className="text-center max-w-2xl mx-auto px-4">
            <span className="inline-block bg-gradient-to-r from-indigo-100 to-fuchsia-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide border border-indigo-200">
              ✨ STATISTICAL DECISION PLATFORM
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
              Welcome to CausalLens
            </h1>
            <p className="text-slate-600 mt-1 text-base font-medium">
              Which statistical method should you use?
            </p>
            <p className="text-slate-500 mt-3 text-[15px] leading-relaxed">
              Answer a couple of questions and we'll route you to the right statistical method — automatically.
            </p>
          </div>
        </div>
      )}

      {view === "finder" && (
        <div className="px-4 animate-[fadeIn_0.3s_ease-in-out]">
          <DecisionRouter onMethodSelected={handleMethodSelected} />
        </div>
      )}

      {view === "tools" && (
        <div className="pt-8 animate-[fadeIn_0.3s_ease-in-out]">
          <Tabs groups={groups} forcedSelection={forcedSelection} />
        </div>
      )}

      <div className="h-20"></div>
    </div>
  );
}

export default App;