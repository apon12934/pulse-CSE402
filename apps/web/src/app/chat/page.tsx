'use client';

import React, { useState } from 'react';
import { Bot, SendHorizontal } from 'lucide-react';
import { Input, Button } from '@pulse/ui';
import { apiPost } from '@/lib/api';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'init',
      role: 'ai',
      text: 'Pulse Assistant initialized. Ready for scheduling directives.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const apiMessages = [...messages, userMessage]
        .filter(m => m.id !== 'init')
        .map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          content: m.text
        }));

      const response = await apiPost<any>('/api/schedule/chat', {
        messages: apiMessages,
        date: today
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        title: response.status === 'approved' ? `Successfully scheduled ${response.tasksCreated} task(s).` : undefined,
        text: response.reply || "I'm sorry, I encountered an error formatting my response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to chat:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        title: 'Error processing directive.',
        text: 'Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] border border-[#262626] max-w-4xl mx-auto rounded-none">
      {/* Header */}
      <div className="h-16 border-b border-[#262626] flex items-center justify-between px-6 shrink-0 bg-[#000000]">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-white" />
          <span className="font-mono text-sm uppercase tracking-wide text-white">Gemini Core</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#666]">{isProcessing ? 'PROCESSING' : 'IDLE'}</span>
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[#FFFF00] animate-pulse' : 'bg-green-500'}`} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <>
                <div className="bg-[#1A1A1A] text-white p-4 text-base max-w-[80%] border border-[#262626] rounded-none">
                  {msg.text}
                </div>
                <span className="font-mono text-[10px] text-gray-500">{msg.timestamp}</span>
              </>
            ) : (
              <>
                <div className="bg-[#121212] border border-[#262626] border-l-2 border-l-[#FFFF00] p-6 text-base w-full max-w-[80%] flex flex-col gap-2 rounded-none">
                  {msg.title && (
                    <div className="font-bold text-white text-lg">
                      {msg.title}
                    </div>
                  )}
                  <div className="text-gray-400 text-sm">
                    {msg.text}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#FFFF00]">SYSTEM · {msg.timestamp}</span>
              </>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex flex-col gap-1 w-full items-start">
            <div className="bg-[#121212] border border-[#262626] border-l-2 border-l-[#FFFF00] p-4 text-sm max-w-[80%] flex items-center justify-center rounded-none">
              <div className="flex space-x-1.5 items-center h-2">
                <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#262626] bg-[#000000]">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-[#121212] border-[#262626] text-white pr-12 font-mono focus-visible:ring-0 focus-visible:border-[#FFFF00] rounded-none py-4 text-sm"
            placeholder="Command Pulse Assistant..."
            disabled={isProcessing}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 text-[#888] hover:text-[#FFFF00] disabled:opacity-50"
          >
            <SendHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
