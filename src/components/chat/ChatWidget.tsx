'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getRelevantContext } from '@/utils/chatContext';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  contextData?: any;
  className?: string;
}

const SUGGESTION_QUESTIONS = [
  'What are the tuition fees for chemistry classes?',
  'Help me understand organic chemistry concepts',
  'What are the school admission requirements?',
  'How can I prepare for chemistry board exams?',
];

export function ChatWidget({ contextData, className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI study assistant. I can help you with academics, assignments, and study guidance. Choose a question below or ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    setShowSuggestions(false);
    sendMessage(question);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Get relevant context based on the user's message
      const relevantContext = contextData
        ? getRelevantContext(contextData, textToSend)
        : contextData;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          contextData: relevantContext,
          history: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
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

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Chat Widget Button - Enhanced Design */}
      {!isOpen && (
        <div className="relative">
          <button
            onClick={handleToggle}
            className="rounded-full h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl transform transition-all duration-300 hover:scale-105 border-0 flex items-center justify-center"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </button>
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-20 pointer-events-none"></div>
        </div>
      )}

      {/* Chat Interface - Enhanced Design */}
      {isOpen && (
        <div className="transform transition-all duration-300 ease-in-out">
          <Card className="w-80 h-[500px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-sm font-medium">
                  AI Study Assistant
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[440px]">
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex transition-all duration-200 ease-in-out',
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-100',
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {/* Suggestions */}
                  {showSuggestions && messages.length === 1 && (
                    <div className="space-y-2 mt-4 transition-all duration-500 ease-in-out">
                      <p className="text-xs text-gray-500 text-center">
                        Quick questions:
                      </p>
                      {SUGGESTION_QUESTIONS.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(question)}
                          className="w-full text-left p-3 text-sm bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-400 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                            {question}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex justify-start transition-all duration-200 ease-in-out">
                      <div className="bg-white text-gray-600 rounded-2xl px-4 py-2.5 text-sm shadow-sm border border-gray-100 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ask me anything..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 transition-all duration-200 transform hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
