import React from "react";

export default function EmailView({ email }) {
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
        <button className="px-4 py-2 bg-cyan-600 rounded">Summarize</button>
        <button className="px-4 py-2 bg-indigo-600 rounded">What tasks?</button>
        <button className="px-4 py-2 bg-rose-600 rounded">Generate Draft</button>
      </div>
    </div>
  );
}
