import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatArea({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0c0c0e] transition-colors">
        <div className="text-center max-w-md space-y-4">
          {/* Hero 4K Logo */}
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-2xl bg-black/10 dark:bg-white/10 blur-xl transform scale-125 pointer-events-none" />
            <img
              src="/logo.svg"
              alt="TradeX AI"
              className="w-20 h-20 mx-auto rounded-2xl shadow-xl relative z-10 border border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              TradeX AI
            </h2>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
              Precision Chart Vision • Universal Intelligence
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Upload any trading chart screenshot for instant <strong>BUY / SELL signals</strong>, exact <strong>Stop Loss</strong>, and <strong>Take Profit targets</strong>.
            <br />
            Or ask <strong>any question</strong> across trading, finance, or general topics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0c0c0e] transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center">
            <img src="/logo.svg" alt="TradeX" className="w-8 h-8 rounded-lg shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800" />
            <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 dark:bg-[#18181c] rounded-2xl rounded-bl-sm border border-transparent dark:border-zinc-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full loading-dot"></div>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium ml-2">Analyzing chart & computing key levels...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
