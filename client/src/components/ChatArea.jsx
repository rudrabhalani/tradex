import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatArea({ messages, isLoading, onQuickPrompt }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0c0c0e] transition-colors">
        <div className="text-center max-w-lg space-y-5">
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
            Upload any trading chart screenshot (TradingView, Binance, Zerodha, MetaTrader) to get instant <strong>BUY / SELL signals</strong>, exact <strong>Stop Loss</strong>, and <strong>Take Profit targets</strong>.
            <br />
            Or ask <strong>any question</strong> (trading, coding, math, general topics) just like Google Gemini!
          </p>

          {/* Quick Starter Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
            <button
              onClick={() => onQuickPrompt && onQuickPrompt('What is the best risk management rule for trading crypto and stocks?')}
              className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-xs text-gray-800 dark:text-zinc-300 shadow-sm"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">⚖️ Risk Management</div>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400">Position sizing & Stop Loss rules</div>
            </button>

            <button
              onClick={() => onQuickPrompt && onQuickPrompt('Who is the founder and owner of TradeX AI?')}
              className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-xs text-gray-800 dark:text-zinc-300 shadow-sm"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">👑 About Founder</div>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400">Learn about Rudra Bhalani</div>
            </button>

            <button
              onClick={() => onQuickPrompt && onQuickPrompt('Explain how Break of Structure (BOS) works in market structure technical analysis.')}
              className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-xs text-gray-800 dark:text-zinc-300 shadow-sm"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">📈 Market Structure</div>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400">BOS, ChoCH & trend shifts</div>
            </button>
          </div>
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
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo.svg" alt="TradeX" className="w-5 h-5 rounded-sm invert dark:invert-0" />
            </div>
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
