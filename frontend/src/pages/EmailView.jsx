import React from "react";
import { agentQuery, createDraft } from "../utils/api";

export default function EmailView({ email }) {
  async function summarize() {
    const res = await agentQuery({
      email_id: email.id,
      instruction: "Summarize this email",
    });
    alert(res.response);
  }

  async function showTasks() {
    const res = await agentQuery({
      email_id: email.id,
      instruction: "What tasks do I need to do?",
    });
    alert(JSON.stringify(res.response, null, 2));
  }

  async function generateDraft() {
    const res = await agentQuery({
      email_id: email.id,
      instruction: "Draft a reply",
    });

    await createDraft({
      email_id: email.id,
      subject: res.response.subject || `Re: ${email.subject}`,
      body: res.response.body || "No body",
      suggested_followups: res.response.suggested_followups || [],
    });

    alert("Draft saved!");
  }

  return (
    <div className="bg-black/30 rounded-lg p-6 h-[70vh] overflow-auto">
      <h2 className="text-2xl font-bold">{email.subject}</h2>
      <p className="text-sm text-slate-400">
        From {email.sender} • {email.timestamp}
      </p>

      <div className="mt-6 whitespace-pre-wrap text-slate-200">
        {email.body}
      </div>

      <div className="mt-6 flex gap-3">
        <button className="px-4 py-2 bg-cyan-600 rounded" onClick={summarize}>
          Summarize
        </button>

        <button className="px-4 py-2 bg-indigo-600 rounded" onClick={showTasks}>
          What tasks?
        </button>

        <button
          className="px-4 py-2 bg-rose-600 rounded"
          onClick={generateDraft}
        >
          Generate Draft
        </button>
      </div>
    </div>
  );
}
