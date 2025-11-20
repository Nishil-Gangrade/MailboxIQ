import React, { useState } from "react";

export default function PromptBrain() {
  const [cat, setCat] = useState(
    "Categorize emails into: Important, Newsletter, Spam, To-Do."
  );
  const [action, setAction] = useState(
    "Extract tasks from the email. Respond in JSON array."
  );
  const [reply, setReply] = useState(
    "Draft a polite reply. Return JSON {subject, body}."
  );

  return (
    <div>
      <h2 className="text-4xl font-extrabold">Prompt Brain</h2>

      <div className="bg-amber-900/20 border border-amber-600/40 p-4 mt-6 rounded">
        <strong>Important Note:</strong>
        <p className="text-slate-300 text-sm mt-2">
          Changing prompts affects all future processing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <Prompt label="Categorization Prompt" value={cat} setValue={setCat} />
        <Prompt label="Action Item Prompt" value={action} setValue={setAction} />
        <div className="col-span-2">
          <Prompt label="Auto Reply Prompt" value={reply} setValue={setReply} />
        </div>
      </div>

      <button className="mt-6 px-4 py-2 bg-green-600 rounded">
        Save Prompts
      </button>
    </div>
  );
}

function Prompt({ label, value, setValue }) {
  return (
    <div className="bg-black/40 p-4 rounded">
      <label className="font-semibold">{label}</label>
      <textarea
        className="w-full mt-2 p-2 bg-black/30 border border-slate-700 rounded text-sm"
        rows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></textarea>
    </div>
  );
}
