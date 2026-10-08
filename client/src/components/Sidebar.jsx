import React from 'react';

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
  theme,
  onToggleTheme
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={onClose} />
      )}

      <aside className={`
        fixed md:relative z-50 md:z-auto
        w-64 h-full bg-gray-50 dark:bg-[#111114] border-r border-gray-200 dark:border-zinc-800/80
        flex flex-col text-gray-900 dark:text-zinc-100
        transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* App Title & Brand Header in Sidebar */}
        <div className="p-3 border-b border-gray-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="TradeX" className="w-6 h-6 rounded-md shadow-sm" />
            <span className="font-extrabold text-base tracking-tight text-black dark:text-white">TradeX AI</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 transition-all text-xs font-bold shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Analysis / Chat</span>
          </button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-1">
          <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1">
            Saved Conversations
          </div>

          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`
                group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs
                transition-all select-none
                ${conv.id === activeId
                  ? 'bg-gray-200/90 dark:bg-zinc-800 text-black dark:text-white font-bold shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-200'}
              `}
              onClick={() => onSelect(conv.id)}
            >
              <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="truncate flex-1">{conv.title || 'Chart Analysis'}</span>
              
              {conversations.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all text-gray-400 hover:text-red-500"
                  title="Delete conversation"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Theme Toggle & Founder Credits */}
        <div className="p-3 border-t border-gray-200 dark:border-zinc-800/80 space-y-2.5 bg-gray-50/50 dark:bg-[#111114]">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase">Switch</span>
            </button>
          )}

          {/* Founder Acknowledgment */}
          <div className="text-center pt-1">
            <p className="text-[11px] font-extrabold text-gray-900 dark:text-white tracking-wide">
              TradeX AI v1.5
            </p>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
              Founded & Owned by{' '}
              <span className="font-bold text-gray-800 dark:text-zinc-200">
                BHALANI RUDRA SANDIPBHAI
              </span>
            </p>
            <p className="text-[9px] text-gray-400 dark:text-zinc-500">
              17-Year-Old Entrepreneur
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
