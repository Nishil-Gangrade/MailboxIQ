import React, { useState, useEffect } from "react";
import { loadInbox, reloadInbox, ingestAll, getProcessed } from "../utils/api";
import EmailView from "./EmailView";
import Spinner from "../components/Spinner";

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function fetchInbox() {
    const data = await loadInbox();
    const processed = await getProcessed();

    const merged = data.map((e) => {
      const p = processed.find((x) => String(x.email_id) === String(e.id));
      return p ? { ...e, category: p.category, action_items: p.action_items } : e;
    });

    setEmails(merged);
  }

  async function loadMock() {
    setLoadingInbox(true);
    const res = await reloadInbox();
    setEmails(res.inbox);
    setProcessedCount(0);
    setLoadingInbox(false);
  }

  async function processInbox() {
    setProcessing(true);
    const res = await ingestAll();
    setProcessedCount(res.processed_count);

    await fetchInbox();
    setProcessing(false);
  }

  useEffect(() => {
    fetchInbox();
  }, []);

  return (
    <div className="bg-neutral-100 text-gray-900 p-6 h-full rounded-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">
            {emails.length} total emails • {processedCount} processed
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={loadMock}
            className="px-4 py-2 bg-gray-300  text-gray-900 hover:bg-gray-400 rounded-md shadow-sm  flex items-center gap-2"
          >
            {loadingInbox && <Spinner />} Load Inbox
          </button>

          <button
            onClick={processInbox}
            className="px-4 py-2 bg-gray-300 text-gray-900 hover:bg-gray-400
 rounded-md shadow-sm  flex items-center gap-2"
          >
            {processing && <Spinner />} Process Inbox
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* EMAIL LIST */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-lg h-[70vh] overflow-auto">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelected(email)}
              className={`p-4 border-b border-gray-200 cursor-pointer transition 
                ${
                  selected?.id === email.id
                    ? "bg-blue-100"
                    : "hover:bg-blue-50"
                }`}
            >
              <div className="font-medium text-gray-900">{email.subject}</div>
              <div className="text-xs text-gray-500">{email.sender}</div>

              {email.category && (
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full
                  ${
                    email.category === "Important"
                      ? "bg-blue-100 text-blue-700"
                      : ""
                  }
                  ${
                    email.category === "To-Do"
                      ? "bg-yellow-100 text-yellow-600"
                      : ""
                  }
                  ${
                    email.category === "Spam"
                      ? "bg-red-100 text-red-700"
                      : ""
                  }
                  ${
                    email.category === "Newsletter"
                      ? "bg-purple-100 text-purple-700"
                      : ""
                  }
                `}
                >
                  {email.category}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* EMAIL VIEW */}
        <div className="col-span-2 bg-white rounded-lg">
          {selected ? (
            <EmailView email={selected} />
          ) : (
            <div className="text-gray-500 text-center mt-20">
              Select an email to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
