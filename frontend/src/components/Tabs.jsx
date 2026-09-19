import { useState, useEffect } from "react";

function Tabs({ groups, forcedSelection }) {
    const [activeGroup, setActiveGroup] = useState(0);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (forcedSelection) {
            setActiveGroup(forcedSelection.groupIndex);
            setActiveTab(forcedSelection.tabIndex);
            // scroll the tabs into view since the router sits above them
            document.getElementById("analysis-tabs")?.scrollIntoView({ behavior: "smooth" });
        }
    }, [forcedSelection]);

    const handleGroupChange = (groupIndex) => {
        setActiveGroup(groupIndex);
        setActiveTab(0);
    };

    return (
        <div id="analysis-tabs" className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center gap-4 mb-6">
                {groups.map((group, index) => (
                    <button
                        key={index}
                        onClick={() => handleGroupChange(index)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${activeGroup === index
                            ? `bg-gradient-to-r ${group.gradient} text-white shadow-lg scale-105`
                            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            }`}
                    >
                        <span className="mr-2">{group.icon}</span>
                        {group.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {groups[activeGroup].tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === index
                            ? "bg-slate-800 text-white shadow-md"
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div>{groups[activeGroup].tabs[activeTab].component}</div>
        </div>
    );
}

export default Tabs;