import React, { useState, useCallback } from "react";
import ChatWindow from "./components/ChatWindow.jsx";
import InputBar from "./components/InputBar.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PERSONALITIES = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
];

let idCounter = 0;
const nextId = () => `msg-${Date.now()}-${idCounter++}`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState("friendly");

  const handleSend = useCallback(
    async (text) => {
      const userMessage = {
        id: nextId(),
        role: "user",
        text,
        timestamp: Date.now(),
      };

      // Build the history to send BEFORE adding the new message,
      // since the backend/Gemini expects prior turns only.
      const historyForRequest = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyForRequest,
            personality,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Request failed with status ${res.status}`);
        }

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "bot",
            text: data.reply,
            timestamp: Date.now(),
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "bot",
            text:
              "Sorry, something went wrong reaching the assistant. Please check your connection and try again.",
            timestamp: Date.now(),
            isError: true,
          },
        ]);
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, personality]
  );

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">GFix Digital Assistant</h1>
          <p className="text-xs text-slate-500">Powered by Gemini</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {PERSONALITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleClear}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear chat
          </button>
        </div>
      </header>

      <ChatWindow messages={messages} isTyping={isTyping} />
      <InputBar onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
