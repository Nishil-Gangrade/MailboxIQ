import React, { useEffect, useState } from "react";
import { getPrompts, savePrompts } from "../utils/api";
import toast from "react-hot-toast";

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
    await savePrompts(prompts);
    toast.success("Prompts saved!");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div
      className="
        bg-neutral-100 
        p-4 sm:p-6 
        rounded-lg 
        border border-gray-200 
        shadow-sm 
        h-auto md:h-[85vh] 
        overflow-y-auto 
        w-full
      "
    >
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Prompt Brain
      </h2>
      <p className="text-gray-500 text-sm mt-1">
        Manage and customize system prompts used by the AI agent.
      </p>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {Object.keys(prompts).map((key) => (
          <div
            key={key}
            className="
              bg-white 
              p-3 sm:p-4 
              border border-gray-200 
              rounded-md 
              w-full
            "
          >
            <label className="font-semibold text-gray-800 capitalize">
              {key.replace("_", " ")}
            </label>

            <textarea
              className="
                w-full 
                mt-2 
                p-2 sm:p-3 
                bg-gray-50 
                border border-gray-300 
                rounded-md 
                text-sm 
                focus:ring-2 focus:ring-blue-500 
                focus:outline-none
              "
              rows={5}
              value={prompts[key]}
              onChange={(e) =>
                setPrompts({ ...prompts, [key]: e.target.value })
              }
            ></textarea>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        className="
          mt-6 
          w-full sm:w-auto 
          px-5 py-2 
          bg-blue-600 
          text-white 
          rounded-md 
          shadow 
          hover:bg-blue-700 
          transition
        "
        onClick={save}
      >
        Save Prompts
      </button>
    </div>
  );
}
