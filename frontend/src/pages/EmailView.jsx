import toast from "react-hot-toast";
import { agentQuery, createDraft } from "../utils/api";
import Spinner from "../components/Spinner";
import React, { useState, useEffect } from "react";

export default function EmailView({ email }) {
  const [active, setActive] = useState(null); 
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    setText("");
    setTasks(null);
    setActive(null);
  }, [email.id]);

  async function askAgent(instruction) {
    setActive(instruction);
    setText("");
    setTasks(null);

    try {
      const res = await agentQuery({ email_id: email.id, instruction });
      const { type, response, data } = res;

      if (type === "summary" || type === "custom" || type === "global") {
        setText(response);
      } else if (type === "tasks") {
        setTasks(data || []);
      } else if (type === "draft") {
        setText(`Subject: ${response.subject}\n\n${response.body}`);
      }

      toast.success("Agent response ready");
    } catch (e) {
      toast.error("Something went wrong");
    }

    setActive(null);
  }

  async function generateDraft() {
    setActive("draft");

    try {
      const res = await agentQuery({
        email_id: email.id,
        instruction: "draft a reply",
      });

      const { response } = res;
      setText(`Subject: ${response.subject}\n\n${response.body}`);

      await createDraft({
        email_id: email.id,
        subject: response.subject,
        body: response.body,
        suggested_followups: [],
      });

      toast.success("Draft saved");
    } catch (e) {
      toast.error("Failed to generate draft");
    }

    setActive(null);
  }

  return (
    <div className="p-6 bg-white">

      <h2 className="text-2xl font-bold text-gray-900">{email.subject}</h2>
      <p className="text-sm text-gray-500">{email.sender}</p>
      <p className="mt-4 text-gray-800">{email.body}</p>

      <div className="flex gap-3 mt-6">

        <button
          onClick={() => askAgent("summary")}
          className="px-4 py-2 bg-blue-700 text-white rounded-md shadow hover:bg-blue-600 flex items-center gap-2"
        >
          {active === "summary" && <Spinner />} Summarize
        </button>

        <button
          onClick={() => askAgent("extract tasks")}
          className="px-4 py-2 bg-green-700 text-white rounded-md shadow hover:bg-green-600 flex items-center gap-2"
        >
          {active === "extract tasks" && <Spinner />} What tasks?
        </button>

        <button
          onClick={generateDraft}
          className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 flex items-center gap-2"
        >
          {active === "draft" && <Spinner />} Generate Draft
        </button>

      </div>

      {(text || tasks) && (
        <div className="mt-6 border border-gray-300 bg-slate-100 p-4 rounded-md shadow-sm">
          <h3 className="font-semibold text-black mb-2">Agent Response</h3>

          {Array.isArray(tasks) ? (
            <ul className="space-y-2 text-gray-800 text-sm">
              {tasks.map((t, i) => (
                <li key={i} className="border-b border-gray-200 pb-2">
                  • {t.task}
                  {t.deadline && (
                    <span className="text-red-600 ml-1">
                      (Deadline: {t.deadline})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="whitespace-pre-wrap text-gray-800 text-sm">
              {text}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
