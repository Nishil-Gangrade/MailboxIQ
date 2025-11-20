import React from "react";

export default function Sidebar({ view, setView }) {
  const navItems = [
    { id: "inbox", label: "Inbox", icon: "📥" },
    { id: "prompts", label: "Prompt Brain", icon: "🧠" },
    { id: "agent", label: "Agent Chat", icon: "💬" },
    { id: "drafts", label: "Drafts", icon: "📝" },
  ];

  return (
    <aside className="w-64 h-screen bg-black/80 border-r border-slate-800 p-6 flex flex-col">
      <div>
        <h1 className="text-3xl font-extrabold text-cyan-400">MailboxIQ</h1>
        <p className="text-slate-400 text-sm">AI-Powered Email Agent</p>
      </div>

      <nav className="mt-8 flex flex-col gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-left ${
              view === item.id
                ? "bg-gradient-to-r from-cyan-700 to-purple-700 text-white"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto text-xs text-slate-600">
        Built for Assignment • 2025
      </div>
    </aside>
  );
}
