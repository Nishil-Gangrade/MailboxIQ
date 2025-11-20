import React, { useState, useEffect } from "react";
import EmailView from "./EmailView";

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);

  async function loadInbox() {
    try {
      const res = await fetch("/assets/mock_inbox.json");
      const data = await res.json();
      setEmails(data);
    } catch (e) {
      console.log("Fallback inbox used");
      setEmails([
        {
          id: 1,
          subject: "Action required: Q4 merge plan",
          sender: "project.manager@acme.com",
          timestamp: "2025-11-10 09:23",
          body: "We need to merge the feature branch before Nov 20...",
        },
      ]);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold">Inbox</h2>
          <p className="text-slate-400">
            {emails.length} total emails • {processedCount} processed
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadInbox}
            className="px-4 py-2 bg-cyan-500 rounded hover:brightness-110"
          >
            Load Mock Inbox
          </button>
          <button
            className="px-4 py-2 bg-emerald-600 rounded hover:brightness-110"
            onClick={() => setProcessedCount(emails.length)}
          >
            Process Inbox
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* LEFT LIST */}
        <div className="col-span-1 bg-black/40 p-4 rounded-lg h-[70vh] overflow-auto">
          {emails.length === 0 ? (
            <div className="text-slate-500 mt-20 text-center">
              No emails loaded yet
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className="border-b border-slate-700 p-3 hover:bg-white/5 cursor-pointer"
                onClick={() => setSelected(email)}
              >
                <div className="font-semibold">{email.subject}</div>
                <div className="text-xs text-slate-400">{email.sender}</div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT EMAIL VIEW */}
        <div className="col-span-2">
          {selected ? (
            <EmailView email={selected} />
          ) : (
            <div className="text-slate-500 text-center mt-20">
              Select an email to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
