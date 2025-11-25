import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { getDrafts, updateDraft } from "../utils/api";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    getDrafts().then(setDrafts);
  }, []);

  function openDraft(d) {
    setSelected(d);
    setSubject(d.subject);
    setBody(d.body);
  }

  async function handleSave() {
    if (!selected) return;

    try {
      await updateDraft({
        id: selected.id,
        subject,
        body,
      });

      toast.success("Draft updated");

      // Reset UI after save
      setSelected(null);
      setSubject("");
      setBody("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update draft");
    }
  }

  return (
    <div className="bg-neutral-100 p-6 rounded-lg min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900">Drafts</h2>
      <p className="text-sm text-gray-500 mt-1">View and edit your saved drafts.</p>

      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* LEFT LIST */}
        <div className="bg-white border border-gray-200 p-4 rounded-md h-[74vh] overflow-auto shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">
            Draft List ({drafts.length})
          </h4>

          {drafts.map((d) => (
            <div
              key={d.id}
              onClick={() => openDraft(d)}
              className={`border border-gray-200 p-3 mb-2 rounded cursor-pointer transition 
                ${
                  selected?.id === d.id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-50 hover:bg-blue-50"
                }`}
            >
              <div className="font-semibold text-gray-800">{d.subject}</div>
              <div className="text-xs text-gray-500">Email #{d.email_id}</div>
            </div>
          ))}

          {drafts.length === 0 && (
            <div className="text-gray-400 mt-10 text-center">No drafts yet</div>
          )}
        </div>

        {/* RIGHT EDITOR */}
        <div className="bg-white border border-gray-200 p-4 rounded-md h-[74vh] overflow-auto shadow-sm">

          {!selected ? (
            <p className="text-gray-400 mt-20 text-center">
              Select a draft to edit
            </p>
          ) : (
            <div>
              <input
                className="w-full p-3 mb-4 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />

              <textarea
                className="w-full h-96 p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body..."
              />

              <button
                onClick={handleSave}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
