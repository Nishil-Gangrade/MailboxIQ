import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Inbox from "./pages/Inbox";
import PromptBrain from "./pages/PromptBrain";
import AgentChat from "./pages/AgentChat";
import Drafts from "./pages/Drafts";

export default function App() {
  const [view, setView] = useState("inbox");

  return (
<div className="flex bg-white text-gray-900 min-h-screen">
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 p-8 overflow-y-auto h-screen">

        {view === "inbox" && <Inbox />}
        {view === "prompts" && <PromptBrain />}
        {view === "agent" && <AgentChat />}
        {view === "drafts" && <Drafts />}
      </main>
    </div>
  );
}
