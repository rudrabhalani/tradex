import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TradeSignalCard, { parseTradeSignal } from './TradeSignalCard';
import voiceService from '../services/voiceService';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [showRawText, setShowRawText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // If assistant message, check if it contains a structured trade signal
  const tradeSignal = !isUser && message.content ? parseTradeSignal(message.content) : null;

  const handleSpeakGeneral = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    voiceService.speak(
      message.content,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''} transition-all`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      ) : (
        <img
          src="/logo.svg"
          alt="TradeX"
          className="w-8 h-8 rounded-lg shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800"
        />
      )}

      {/* Content */}
      <div className={`w-full ${tradeSignal ? 'max-w-2xl' : 'max-w-[85%]'} ${isUser ? 'text-right' : ''}`}>
        {/* Uploaded Chart Image preview */}
        {message.imageUrl && (
          <div className="mb-2.5">
            <img
              src={message.imageUrl}
              alt="Trading chart"
              className="max-w-full max-h-80 rounded-2xl border border-gray-200 dark:border-zinc-800 inline-block shadow-md object-contain bg-black/5 dark:bg-white/5"
            />
          </div>
        )}

        {/* Message Rendering */}
        {message.content && (
          <>
            {isUser ? (
              <div className="inline-block px-4 py-3 rounded-2xl bg-black dark:bg-zinc-100 text-white dark:text-black text-sm rounded-br-sm leading-relaxed shadow-sm">
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
                    className="text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 underline transition-colors flex items-center gap-1"
                  >
                    <span>{showRawText ? '▲ Hide Full Text Analysis' : '▼ View Full Analysis Breakdown'}</span>
                  </button>

                  {showRawText && (
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-700 dark:text-zinc-300 leading-relaxed prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Standard Versatile AI Response (Like Google Gemini) */
              <div className="inline-block px-4 sm:px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-[#18181c] text-black dark:text-zinc-100 rounded-bl-sm text-sm leading-relaxed text-left w-full shadow-sm border border-transparent dark:border-zinc-800/80 relative group">
                {/* Audio Read-Aloud Button for General Responses */}
                <div className="flex justify-end mb-1">
                  <button
                    onClick={handleSpeakGeneral}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      isSpeaking
                        ? 'bg-black dark:bg-white text-white dark:text-black scale-105'
                        : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                    }`}
                    title="Read answer aloud"
                  >
                    <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                    <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                  </button>
                </div>

                <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-zinc-200 prose-strong:text-black dark:prose-strong:text-white prose-li:text-gray-800 dark:prose-li:text-zinc-200 prose-code:bg-gray-200 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:text-gray-100">
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
