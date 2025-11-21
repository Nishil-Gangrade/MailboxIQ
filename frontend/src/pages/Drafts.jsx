import React, { useEffect, useState } from "react";
import { getDrafts } from "../utils/api";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    getDrafts().then(setDrafts);
  }, []);

  return (
    <div>
      <h2 className="text-4xl font-extrabold">Drafts</h2>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-black/40 p-4 rounded h-[70vh] overflow-auto">
          <h4 className="font-semibold">Draft List ({drafts.length})</h4>

          {drafts.map((d) => (
            <div key={d.id} className="border-b border-slate-700 p-3">
              <div className="font-semibold">{d.subject}</div>
              <div className="text-xs text-slate-400">
                email #{d.email_id}
              </div>
            </div>
          ))}

          {drafts.length === 0 && (
            <div className="text-slate-500 mt-10 text-center">No drafts yet</div>
          )}
        </div>

        <div className="bg-black/20 p-4 rounded h-[70vh]">
          <p className="text-slate-500 mt-20 text-center">
            Select a draft or generate new one
          </p>
        </div>
      </div>
    </div>
  );
}
