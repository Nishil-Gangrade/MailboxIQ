import React, { useState, useEffect } from "react";
import { loadInbox, agentQuery } from "../utils/api";

export default function AgentChat() {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Load inbox on mount
  useEffect(() => {
    loadInbox().then(setEmails);
  }, []);

  // ---- CLEAN FORMATTER FOR ALL RESPONSES ----
  function formatResponse(res) {
    if (!res) return "No response.";

    const r = res.response;

    // 1️⃣ Draft: {subject, body}
    if (res.type === "draft" && r?.subject && r?.body) {
      return `Subject: ${r.subject}\n\n${r.body}`;
    }

    // 2️⃣ Summary, Custom → plain string
    if (typeof r === "string") {
      return r;
    }

    // 3️⃣ Summary wrapped inside { response: "text" }
    if (typeof r === "object" && typeof r.response === "string") {
      return r.response;
    }

    // 4️⃣ Global inbox summary → string
    if (res.type === "global" && typeof r === "string") {
      return r;
    }

    // Fallback
    return JSON.stringify(r, null, 2);
  }

  // ---- SEND QUERY TO BACKEND ----
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
      setMessages([{ q: query, a: "Error contacting the agent." }, ...messages]);
    }

    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold">Email Agent Chat</h2>

      <div className="grid grid-cols-3 gap-6 mt-6">

        {/* LEFT PANEL — Email list */}
        <div className="col-span-1 bg-black/40 rounded p-4">
          <button
            className="w-full p-2 bg-teal-800 rounded"
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
              className="w-full mt-2 p-2 rounded hover:bg-white/10 text-left"
            >
              {e.subject}
            </button>
          ))}
        </div>

        {/* RIGHT PANEL — Chat window */}
        <div className="col-span-2 bg-black/20 p-6 rounded min-h-[60vh] flex flex-col">

          <div className="flex-1 overflow-auto space-y-4">

            {/* Show selected email */}
            {selected && (
              <div className="bg-white/5 p-4 rounded border border-slate-700">
                <div className="text-xl font-bold text-cyan-300">{selected.subject}</div>
                <div className="mt-2 text-slate-300 whitespace-pre-wrap">
                  {selected.body}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((m, i) => (
              <div key={i} className="bg-white/5 p-4 rounded">
                <div className="font-semibold">You: {m.q}</div>

                <pre className="mt-2 text-slate-300 whitespace-pre-wrap">
                  {m.a}
                </pre>
              </div>
            ))}

            {/* Empty state */}
            {!selected && messages.length === 0 && (
              <p className="text-center text-slate-500 mt-20">
                Start a conversation…
              </p>
            )}

          </div>

          {/* Input box */}
          <div className="mt-4 flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 p-3 rounded bg-black/30 border border-slate-700"
              placeholder="Ask anything…"
            />

            <button
              className="px-4 py-2 bg-cyan-600 rounded flex items-center justify-center w-20"
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
