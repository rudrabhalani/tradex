import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TradeSignalCard, { parseTradeSignal } from './TradeSignalCard';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [showRawText, setShowRawText] = useState(false);

  // If assistant message, check if it contains a structured trade signal
  const tradeSignal = !isUser && message.content ? parseTradeSignal(message.content) : null;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-gray-200' : 'bg-black'
      }`}>
        {isUser ? (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" viewBox="0 0 32 32" fill="none">
            <polyline points="4,24 10,16 16,20 22,8 28,12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        )}
      </div>

      {/* Content */}
      <div className={`w-full ${tradeSignal ? 'max-w-2xl' : 'max-w-[85%]'} ${isUser ? 'text-right' : ''}`}>
        {/* Uploaded Chart Image preview */}
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Trading chart"
              className="max-w-full max-h-80 rounded-xl border border-gray-200 inline-block shadow-sm"
            />
          </div>
        )}

        {/* Message Rendering */}
        {message.content && (
          <>
            {isUser ? (
              <div className="inline-block px-4 py-3 rounded-2xl bg-black text-white text-sm rounded-br-md leading-relaxed">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ) : tradeSignal ? (
              /* High-impact Visual Signal Card with Green/Red Gradients */
              <div className="w-full space-y-2">
                <TradeSignalCard data={tradeSignal} />

                {/* Optional Collapsible for Raw/Extra Details */}
                <div className="text-left px-1">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-xs text-gray-500 hover:text-gray-800 underline transition-colors flex items-center gap-1"
                  >
                    <span>{showRawText ? '▲ Hide Full Text Analysis' : '▼ View Full Analysis Breakdown'}</span>
                  </button>

                  {showRawText && (
                    <div className="mt-2 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Standard Versatile AI Response (Like Google Gemini) */
              <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100 text-black rounded-bl-md text-sm leading-relaxed text-left w-full shadow-sm">
                <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-gray-800 prose-strong:text-black prose-li:text-gray-800 prose-code:bg-gray-200/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
