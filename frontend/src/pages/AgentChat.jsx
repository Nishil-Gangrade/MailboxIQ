import React, { useState, useEffect } from "react";
import { loadInbox, agentQuery } from "../utils/api";

export default function AgentChat() {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInbox().then(setEmails);
  }, []);

  function formatResponse(res) {
    if (!res) return "No response.";
    const r = res.response;

    if (res.type === "draft" && r?.subject && r?.body)
      return `Subject: ${r.subject}\n\n${r.body}`;

    if (typeof r === "string") return r;
    if (typeof r === "object" && typeof r.response === "string")
      return r.response;
    if (res.type === "global" && typeof r === "string") return r;

    return JSON.stringify(r, null, 2);
  }

  async function send() {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await agentQuery({
        email_id: selected?.id || null,
        instruction: query,
      });

      const answer = formatResponse(res);
      setMessages([{ q: query, a: answer }, ...messages]);
      setQuery("");
    } catch {
      setMessages([
        { q: query, a: "Error contacting the agent." },
        ...messages,
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="bg-neutral-100 p-6 rounded-lg border border-gray-200 shadow-sm min-h-[85vh]">
      {/* PAGE TITLE */}
      <h2 className="text-3xl font-bold text-gray-900">Email Agent Chat</h2>
      <p className="text-gray-500 text-sm mt-1">
        Chat directly with your AI email agent.
      </p>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* LEFT PANEL */}
        <div className="bg-white border border-gray-200 rounded-md p-4 h-[70vh] overflow-y-auto">
          <button
            className="w-full p-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            onClick={() => {
              setSelected(null);
              setMessages([]);
            }}
          >
            Global Inbox View
          </button>

          {emails.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setSelected(e);
                setMessages([]);
              }}
              className={`w-full mt-2 p-3 rounded-md text-left border border-gray-300 hover:bg-blue-50 transition
                ${
                  selected?.id === e.id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white"
                }`}
            >
              <div className="font-semibold text-gray-800">{e.subject}</div>
              <div className="text-xs text-gray-500">{e.sender}</div>
            </button>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-2 bg-white border border-gray-200 p-6 rounded-md flex flex-col min-h-[70vh]">
          {/* CHAT SCROLL AREA */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selected && (
              <div className="bg-gray-100 border border-gray-300 p-4 rounded-md">
                <div className="text-lg font-bold text-gray-900">
                  {selected.subject}
                </div>
                <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {selected.body}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className="bg-gray-100 p-4 border border-gray-300 rounded-md shadow-sm"
              >
                <div className="font-semibold text-gray-800">You: {m.q}</div>
                <pre className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {m.a}
                </pre>
              </div>
            ))}

            {messages.length === 0 && !selected && (
              <p className="text-center text-gray-400 mt-20">
                Start a conversation…
              </p>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="mt-4 flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="flex-1 p-3 rounded-md bg-gray-50 border border-gray-300 
             focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ask anything…"
            />

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 w-24 flex items-center justify-center"
              onClick={send}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Ask"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
