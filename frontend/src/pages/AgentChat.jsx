import React, { useState } from "react";

export default function AgentChat() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");

  function sendQuery() {
    if (!query.trim()) return;

    const reply = "AI Agent Response (mock)…";

    setMessages([{ q: query, a: reply }, ...messages]);
    setQuery("");
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold">Email Agent Chat</h2>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Left email context list */}
        <div className="col-span-1 bg-black/40 p-4 rounded">
          <h4 className="font-semibold">Email Context</h4>
          <button className="w-full mt-4 p-2 bg-teal-900 rounded">
            Global Inbox View
          </button>
        </div>

        {/* Chat window */}
        <div className="col-span-2 bg-black/20 p-6 rounded min-h-[60vh] flex flex-col">
          <div className="flex-1 overflow-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className="bg-white/5 p-4 rounded">
                <div className="font-semibold">You: {m.q}</div>
                <div className="mt-2 text-slate-300">{m.a}</div>
              </div>
            ))}

            {messages.length === 0 && (
              <p className="text-center text-slate-500 mt-20">
                Start a conversation with your agent…
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 p-3 rounded bg-black/30 border border-slate-700"
            />
            <button className="px-4 py-2 bg-cyan-600 rounded" onClick={sendQuery}>
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
