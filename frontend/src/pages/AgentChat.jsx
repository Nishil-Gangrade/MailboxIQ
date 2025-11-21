import React, { useState, useEffect } from "react";
import { loadInbox, agentQuery } from "../utils/api";

export default function AgentChat() {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadInbox().then(setEmails);
  }, []);

  async function send() {
    if (!query.trim()) return;

    const res = await agentQuery({
      email_id: selected?.id || null,
      instruction: query,
    });

    setMessages([{ q: query, a: res.response }, ...messages]);
    setQuery("");
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold">Email Agent Chat</h2>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Context list */}
        <div className="col-span-1 bg-black/40 rounded p-4">
          <button
            className="w-full p-2 bg-teal-800 rounded"
            onClick={() => setSelected(null)}
          >
            Global Inbox View
          </button>

          {emails.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className="w-full mt-2 p-2 rounded hover:bg-white/10 text-left"
            >
              {e.subject}
            </button>
          ))}
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
                Start a conversation…
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 p-3 rounded bg-black/30 border border-slate-700"
              placeholder="Ask anything…"
            />
            <button className="px-4 py-2 bg-cyan-600 rounded" onClick={send}>
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
