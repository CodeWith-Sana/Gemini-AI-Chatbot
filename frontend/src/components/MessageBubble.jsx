import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available, ignore silently
    }
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
          isUser
            ? "bg-brand-500 text-white rounded-br-sm"
            : message.isError
            ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
            : "bg-slate-200 text-slate-800 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
            {message.text}
          </p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-slate-800 prose-pre:text-slate-100">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}

        <div
          className={`mt-1 flex items-center gap-2 text-[10px] ${
            isUser ? "text-brand-100 justify-end" : "text-slate-500"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && !message.isError && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity underline decoration-dotted"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
