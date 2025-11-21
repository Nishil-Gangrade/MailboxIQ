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

  // Merge category + action items into inbox UI
 const merged = data.map(e => {
  const p = processed.find(x => String(x.email_id) === String(e.id));
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
  onClick={loadMock}
  className="px-4 py-2 bg-cyan-500 rounded hover:brightness-110 flex items-center gap-2"
>
  {loadingInbox && <Spinner />} Load Inbox
</button>


          <button
  onClick={processInbox}
  className="px-4 py-2 bg-emerald-600 rounded hover:brightness-110 flex items-center gap-2"
>
  {processing && <Spinner />} Process Inbox
</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="col-span-1 bg-black/40 p-4 rounded-lg h-[70vh] overflow-auto">
          {emails.map((email) => (
            <div
  key={email.id}
  className="border-b border-slate-700 p-3 hover:bg-white/5 cursor-pointer"
  onClick={() => setSelected(email)}
>
  <div className="font-semibold">{email.subject}</div>
  <div className="text-xs text-slate-400">{email.sender}</div>

  {email.category && (
    <span
      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full 
      ${email.category === "Important" ? "bg-blue-700/60 text-blue-200" : ""}
      ${email.category === "To-Do" ? "bg-yellow-700/60 text-yellow-200" : ""}
      ${email.category === "Spam" ? "bg-red-700/60 text-red-200" : ""}
      ${email.category === "Newsletter" ? "bg-purple-700/60 text-purple-200" : ""}
      `}
    >
      {email.category}
    </span>
  )}
</div>

          ))}
        </div>

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
