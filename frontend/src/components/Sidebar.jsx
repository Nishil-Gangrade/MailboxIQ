import React from "react";
import logo from "../../../assets/logo.png";

import { Inbox, Brain, MessageSquare, FileText } from "lucide-react";

export default function Sidebar({ view, setView }) {
  const navItems = [
    { id: "inbox", label: "Inbox", icon: <Inbox size={20} /> },
    { id: "prompts", label: "Prompt Brain", icon: <Brain size={20} /> },
    { id: "agent", label: "Agent Chat", icon: <MessageSquare size={20} /> },
    { id: "drafts", label: "Drafts", icon: <FileText size={20} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white   p-6 flex flex-col">

      {/* LOGO SECTION */}
      <div className="flex items-center gap-3 mb-4 cursor-pointer select-none">
        <img src={logo} className="w-16
         h-14" />

        <h1 className="text-l font-semibold text-gray-800">MailboxIQ</h1>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex flex-col gap-1 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all text-left group
              ${
                view === item.id
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-blue-50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-700 group-hover:text-blue-700">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="mt-auto text-xs text-gray-500">
        Built for Assignment • 2025
      </div>
    </aside>
  );
}
