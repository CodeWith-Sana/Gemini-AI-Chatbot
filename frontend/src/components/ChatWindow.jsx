import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-200 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-slate-500 animate-blink [animation-delay:-0.32s]" />
        <span className="h-2 w-2 rounded-full bg-slate-500 animate-blink [animation-delay:-0.16s]" />
        <span className="h-2 w-2 rounded-full bg-slate-500 animate-blink" />
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {messages.length === 0 && !isTyping && (
          <div className="mt-16 text-center text-slate-400">
            <p className="text-lg font-medium">Say hello 👋</p>
            <p className="text-sm">Ask anything — your GFix Digital assistant is ready.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
