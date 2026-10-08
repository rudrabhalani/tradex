import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';

const STORAGE_KEY_CONVS = 'tradex_conversations_v3';
const STORAGE_KEY_ACTIVE = 'tradex_active_id_v3';
const STORAGE_KEY_THEME = 'tradex_theme';

function App() {
  // Theme state: dark by default (preferred by traders)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  });

  // Conversation history persistence in localStorage
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
    }
    return [{ id: 1, title: 'New Analysis', messages: [] }];
  });

  const [activeConversationId, setActiveConversationId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (savedId) {
        return Number(savedId);
      }
    } catch (e) {}
    return 1;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nextConvId = useRef(Date.now());

  // Apply dark class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Could not persist conversations to localStorage (quota or size limit):', e);
    }
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, String(activeConversationId));
  }, [activeConversationId]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0] || { id: 1, title: 'New Analysis', messages: [] };

  const addMessage = useCallback((role, content, imageUrl = null) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const newMessages = [...conv.messages, { role, content, imageUrl, timestamp: Date.now() }];
        // Update title from first user message
        let title = conv.title;
        if (conv.messages.length === 0 && role === 'user') {
          title = content ? content.substring(0, 28) + (content.length > 28 ? '...' : '') : 'Chart Analysis';
        }
        return { ...conv, messages: newMessages, title };
      }
      return conv;
    }));
  }, [activeConversationId]);

  const getConversationHistory = useCallback(() => {
    return activeConversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content || (msg.imageUrl ? '[Chart image uploaded]' : ''),
    }));
  }, [activeConversation]);

  const handleNewConversation = useCallback(() => {
    const id = nextConvId.current++;
    setConversations(prev => [{ id, title: 'New Analysis', messages: [] }, ...prev]);
    setActiveConversationId(id);
    setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback((id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const newId = nextConvId.current++;
        return [{ id: newId, title: 'New Analysis', messages: [] }];
      }
      return filtered;
    });
    if (activeConversationId === id) {
      setConversations(prev => {
        setActiveConversationId(prev[0]?.id || 1);
        return prev;
      });
    }
  }, [activeConversationId]);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-zinc-100 transition-colors overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => { setActiveConversationId(id); setSidebarOpen(false); }}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-[#121215] shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
              title="Open Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 4K Logo and Brand */}
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="TradeX" className="w-7 h-7 rounded-lg shadow-sm" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-black dark:text-white">TradeX</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded ml-2">
                  v1.5 AI
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Controls (New Chat + Theme Toggle) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors"
              title="Start a new chat"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Analysis</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors flex items-center justify-center text-sm"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <ChatArea
          messages={activeConversation.messages}
          isLoading={isLoading}
        />

        {/* Input Area */}
        <InputArea
          onSend={addMessage}
          conversationHistory={getConversationHistory}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          addMessage={addMessage}
        />

        {/* Legal & Financial Disclaimer Bar */}
        <div className="px-4 py-1.5 bg-white dark:bg-[#09090b] text-center border-t border-gray-100 dark:border-zinc-900/60 shrink-0">
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-tight">
            ⚖️ <strong>Regulatory Disclosure:</strong> TradeX AI provides educational market research and universal intelligence. It does not provide certified financial, investment, or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
