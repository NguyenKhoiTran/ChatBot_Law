import React, { createContext, useContext, useState, useCallback } from 'react';
import { chatApi } from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessions, setSessions]         = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [isLoading, setIsLoading]       = useState(false);

  // Load all sessions for the sidebar
  const loadSessions = useCallback(async () => {
    try {
      const data = await chatApi.getSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
  }, []);

  // Load messages of a specific session
  const selectSession = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId);
    setIsLoading(true);
    try {
      const msgs = await chatApi.getMessages(sessionId);
      setMessages(msgs);
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start a fresh chat (no session yet)
  const newChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  // Send a message → call RAG API → update messages
  const sendMessage = useCallback(async (question) => {
    // Optimistic: add user message immediately
    const tempUserMsg = { id: Date.now(), role: 'user', content: question, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await chatApi.ask(question, activeSessionId);

      // If this was a new chat, set the session id
      if (!activeSessionId) {
        setActiveSessionId(res.session_id);
        // Refresh sidebar sessions
        const updated = await chatApi.getSessions();
        setSessions(updated);
      }

      // Add assistant reply
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Lỗi: ${e.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId) => {
    await chatApi.deleteSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) newChat();
  }, [activeSessionId, newChat]);

  return (
    <ChatContext.Provider value={{
      sessions, messages, activeSessionId, isLoading,
      loadSessions, selectSession, newChat, sendMessage, deleteSession,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
