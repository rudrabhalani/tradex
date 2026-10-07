import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatArea({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" viewBox="0 0 32 32" fill="none">
            <polyline points="4,24 10,16 16,20 22,8 28,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload a chart to analyze</h2>
          <p className="text-sm text-gray-500">
            Upload a trading chart screenshot from any platform — TradingView, Binance, MetaTrader, or any broker. 
            TradeX will analyze the chart and provide entry, stop loss, and take profit levels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 32 32" fill="none">
                <polyline points="4,24 10,16 16,20 22,8 28,12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="flex items-center gap-1 py-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
