import toast from "react-hot-toast";
import { agentQuery, createDraft } from "../utils/api";
import Spinner from "../components/Spinner";
import React, { useState, useEffect } from "react";

export default function EmailView({ email }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    setText("");
    setTasks(null);
  }, [email.id]);

  // -----------------------------
  // AGENT BUTTON HANDLER
  // -----------------------------
  async function askAgent(instruction) {
    setLoading(true);
    setTasks(null);
    setText("");

    try {
      const res = await agentQuery({
        email_id: email.id,
        instruction,
      });

      const { type, response, data } = res;

      // 🔥 SAFETY FIX — ALWAYS MAKE TEXT A STRING
      const safeText =
        typeof response === "object" && !Array.isArray(response)
          ? JSON.stringify(response, null, 2)
          : response;

      if (type === "summary") {
        setText(safeText);
      } else if (type === "tasks") {
        setTasks(data || []);
      } else if (type === "draft") {
        const draftText = `Subject: ${response.subject}\n\n${response.body}`;
        setText(draftText);
      } else {
        setText(safeText);
      }

      toast.success("Agent response ready");
    } catch {
      toast.error("Something went wrong");
    }

    setLoading(false);
  }

  // -----------------------------
  // GENERATE DRAFT
  // -----------------------------
  async function generateDraft() {
    setLoading(true);

    try {
      const res = await agentQuery({
        email_id: email.id,
        instruction: "Draft a reply",
      });

      await createDraft({
        email_id: email.id,
        subject: res.response.subject,
        body: res.response.body,
        suggested_followups: [],
      });

      toast.success("Draft saved");
    } catch {
      toast.error("Draft creation failed");
    }

    setLoading(false);
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div>
      <h2 className="text-2xl font-bold">{email.subject}</h2>
      <p className="text-sm text-slate-400">{email.sender}</p>
      <p className="mt-4">{email.body}</p>

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => askAgent("Summarize")}
          className="bg-cyan-600 px-4 py-2 rounded flex items-center gap-2"
        >
          {loading && <Spinner />} Summarize
        </button>

        <button
          onClick={() => askAgent("Extract tasks")}
          className="bg-purple-600 px-4 py-2 rounded flex items-center gap-2"
        >
          {loading && <Spinner />} What tasks?
        </button>

        <button
          onClick={generateDraft}
          className="bg-rose-600 px-4 py-2 rounded flex items-center gap-2"
        >
          {loading && <Spinner />} Generate Draft
        </button>
      </div>

      {(text || tasks) && (
        <div className="mt-6 bg-black/40 p-4 rounded border border-slate-700">
          <h3 className="text-cyan-300 font-semibold mb-2">Agent Response</h3>

          {Array.isArray(tasks) ? (
            <ul className="space-y-2 text-slate-200 text-sm">
              {tasks.map((t, i) => (
                <li key={i} className="border-b border-slate-700 pb-2">
                  • {t.task}
                  {t.deadline && (
                    <span className="text-yellow-300 ml-2">
                      (Deadline: {t.deadline})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="whitespace-pre-wrap text-slate-200 text-sm">
              {text}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
