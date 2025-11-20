import React from "react";

export default function Drafts() {
  return (
    <div>
      <h2 className="text-4xl font-extrabold">Drafts</h2>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-black/40 p-4 rounded h-[70vh] overflow-auto">
          <h4 className="font-semibold">Draft List (0)</h4>
          <p className="text-slate-500 mt-10 text-center">No drafts yet</p>
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
