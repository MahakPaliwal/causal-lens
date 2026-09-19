import { useState } from "react";
import apiClient from "../api/client";

function AiExplain({ methodName, resultData }) {
    const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content: string }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [followUp, setFollowUp] = useState("");
    const [started, setStarted] = useState(false);

    const callApi = async (followUpQuestion = null) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.post("/interpret/", {
                method_name: methodName,
                result_json: resultData,
                conversation_history: messages,
                follow_up_question: followUpQuestion,
            });

            const newMessages = [...messages];
            if (followUpQuestion) {
                newMessages.push({ role: "user", content: followUpQuestion });
            }
            newMessages.push({ role: "assistant", content: response.data.explanation });
            setMessages(newMessages);
        } catch (err) {
            setError("Couldn't generate a response right now.");
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        setStarted(true);
        callApi(null);
    };

    const handleFollowUp = (e) => {
        e.preventDefault();
        if (!followUp.trim()) return;
        callApi(followUp.trim());
        setFollowUp("");
    };

    return (
        <div className="mt-4">
            {!started && (
                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
                >
                    Get AI Insights
                </button>
            )}

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            {started && (
                <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-3">
                    {messages.map((msg, i) => (
                        <div key={i} className="w-full">
                            {msg.role === "user" ? (
                                <div className="text-right">
                                    <span className="inline-block text-sm px-4 py-3 rounded-lg bg-slate-800 text-white max-w-[85%] whitespace-pre-line">
                                        {msg.content}
                                    </span>
                                </div>
                            ) : (
                                <div className="block w-full text-sm px-4 py-3 rounded-lg bg-white text-violet-900 border border-violet-100 whitespace-pre-line leading-relaxed">
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="text-left">
                            <span className="inline-block text-sm px-3 py-2 rounded-lg bg-white border border-violet-100 text-violet-400">
                                <span className="inline-block w-2 h-2 bg-violet-400 rounded-full animate-pulse mr-1"></span>
                                <span className="inline-block w-2 h-2 bg-violet-400 rounded-full animate-pulse mr-1" style={{ animationDelay: "0.2s" }}></span>
                                <span className="inline-block w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></span>
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleFollowUp} className="flex gap-2 pt-2 border-t border-violet-100">
                        <input
                            type="text"
                            value={followUp}
                            onChange={(e) => setFollowUp(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            disabled={loading}
                            className="flex-1 text-sm border border-violet-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-400 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading || !followUp.trim()}
                            className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-40"
                        >
                            Ask
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AiExplain;