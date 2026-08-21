'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { makeApiCall } from '@/utils/ApiRequest';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export function PravahaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history from backend
  const loadMessageHistory = useCallback(async (sid: string) => {
    try {
      const response = await makeApiCall({
        path: `/chat/session/${sid}/messages`,
        method: 'GET',
        baseUrl: 'ragantic',
      });

      // Each backend entry is one query+response exchange, not a single
      // chat turn - expand it into a user message followed by an AI message.
      const exchanges: {
        id: string;
        query: string;
        response: string;
        timestamp: number;
      }[] = response.data.attributes.messages || [];

      const loadedMessages: Message[] = exchanges.flatMap((exchange) => [
        {
          id: `${exchange.id}-user`,
          text: exchange.query,
          sender: 'user' as const,
          timestamp: exchange.timestamp * 1000,
        },
        {
          id: `${exchange.id}-ai`,
          text: exchange.response,
          sender: 'ai' as const,
          timestamp: exchange.timestamp * 1000,
        },
      ]);

      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      } else {
        // Add welcome message if no history
        setMessages([
          {
            id: 'welcome',
            text: 'Hi! How can I assist you today?',
            sender: 'ai',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
      // Add welcome message on error
      setMessages([
        {
          id: 'welcome',
          text: 'Hi! How can I assist you today?',
          sender: 'ai',
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  // Create or restore session when chat opens. org_id/user_id come from the
  // caller's own auth token server-side - this widget is only ever shown to
  // logged-in users (student, teacher, or admin), so no org/subdomain needs
  // to be sent up here at all.
  const initializeSession = useCallback(async () => {
    try {
      const storedSessionId = localStorage.getItem('pravahaSessionId');

      const response = await makeApiCall({
        path: '/chat/session',
        method: 'POST',
        baseUrl: 'ragantic',
        payload: {
          data: {
            type: 'session',
            attributes: storedSessionId ? { sessionId: storedSessionId } : {},
          },
        },
      });

      const returnedSessionId = response.data.attributes.sessionId;
      setSessionId(returnedSessionId);
      localStorage.setItem('pravahaSessionId', returnedSessionId);

      // Load message history if session exists
      await loadMessageHistory(returnedSessionId);
    } catch (error) {
      console.error('Error initializing session:', error);
      // Fallback to client-side session
      const fallbackSessionId = `sess_${Date.now()}`;
      setSessionId(fallbackSessionId);
      localStorage.setItem('pravahaSessionId', fallbackSessionId);
      // Add welcome message on error
      setMessages([
        {
          id: 'welcome',
          text: 'Hi! How can I assist you today?',
          sender: 'ai',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [loadMessageHistory]);

  // Initialize session when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession();
    }
  }, [isOpen, sessionId, initializeSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // org_id/user_id come from the caller's own auth token server-side -
      // no need to resolve or send them from here.
      const response = await makeApiCall({
        path: '/chat/query',
        method: 'POST',
        baseUrl: 'ragantic',
        payload: {
          data: {
            type: 'chat_query',
            attributes: {
              query: userMessage.text,
              sessionId: sessionId,
            },
          },
        },
      });

      const aiResponse = response.data.attributes.response;

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: aiResponse,
        sender: 'ai',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Start a new chat session
  const startNewChat = () => {
    // Clear current session from localStorage
    localStorage.removeItem('pravahaSessionId');
    // Reset state
    setSessionId('');
    setMessages([]);
    // Initialize new session
    initializeSession();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
          aria-label="Open chat assistant"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold">Hekud</h3>
                <p className="text-xs text-indigo-100">AI-powered assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={startNewChat}
                className="text-white hover:text-indigo-100 transition-colors p-1"
                aria-label="Start new chat"
                title="Start new chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-indigo-100 transition-colors p-1"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-indigo-100'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-background text-foreground"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                aria-label="Send message"
              >
                <Image
                  src="/icons/image-photoroom.png"
                  alt="Send"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
