import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';

function App() {
  const [conversations, setConversations] = useState([{ id: 1, title: 'New Analysis', messages: [] }]);
  const [activeConversationId, setActiveConversationId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nextConvId = useRef(2);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const addMessage = useCallback((role, content, imageUrl = null) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const newMessages = [...conv.messages, { role, content, imageUrl, timestamp: Date.now() }];
        // Update title from first user message
        let title = conv.title;
        if (conv.messages.length === 0 && role === 'user') {
          title = content ? content.substring(0, 30) + (content.length > 30 ? '...' : '') : 'Chart Analysis';
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
    setConversations(prev => [...prev, { id, title: 'New Analysis', messages: [] }]);
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
        setActiveConversationId(prev[0]?.id);
        return prev;
      });
    }
  }, [activeConversationId]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => { setActiveConversationId(id); setSidebarOpen(false); }}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center h-14 px-4 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
              <polyline points="4,24 10,16 16,20 22,8 28,12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="4" y1="28" x2="28" y2="28" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-lg">TradeX</span>
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

        {/* Disclaimer */}
        <div className="px-4 py-2 text-center">
          <p className="text-xs text-gray-400">
            AI-generated market analysis is for educational and informational purposes only. It is not financial advice and does not guarantee profits.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
