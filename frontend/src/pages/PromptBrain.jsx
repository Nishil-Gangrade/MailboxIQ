import React, { useEffect, useState } from "react";
import { getPrompts, savePrompts } from "../utils/api";

export default function PromptBrain() {
  const [prompts, setPrompts] = useState({
    categorization: "",
    action_item: "",
    auto_reply: "",
  });

  async function load() {
    const data = await getPrompts();
    setPrompts(data);
  }

  async function save() {
    const res = await savePrompts(prompts);
    alert("Prompts saved!");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="text-4xl font-extrabold">Prompt Brain</h2>

      <div className="grid grid-cols-2 gap-6 mt-6">
        {Object.keys(prompts).map((key) => (
          <div
            key={key}
            className="col-span-2 bg-black/40 p-4 rounded"
          >
            <label className="font-semibold">{key.replace("_", " ")}</label>
            <textarea
              className="w-full mt-2 p-2 bg-black/30 border border-slate-700 rounded text-sm"
              rows={5}
              value={prompts[key]}
              onChange={(e) =>
                setPrompts({ ...prompts, [key]: e.target.value })
              }
            ></textarea>
          </div>
        ))}
      </div>

      <button className="mt-6 px-4 py-2 bg-green-600 rounded" onClick={save}>
        Save Prompts
      </button>
    </div>
  );
}
