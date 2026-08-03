'use client'

import React, { useState, useEffect } from 'react';
import { Check, X, Bot, SendHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@pulse/ui';
import { apiPost } from '@/lib/api';
import { format } from 'date-fns';

import { useTaskStore } from '@/store/tasks';

export function AiChatPanel() {
  const { tasks, updateTasks } = useTaskStore();
  const [messages, setMessages] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_chat_history');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: 'init',
        role: 'ai',
        text: 'Gemini Core initialized. Ready to draft your schedule. What are your goals today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'chatting'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pulse_chat_history', JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    setMessages([
      {
        id: 'init',
        role: 'ai',
        text: 'Gemini Core initialized. Ready to draft your schedule. What are your goals today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'chatting'
      }
    ]);
  };
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      // Build history for backend (excluding internal AI messages that might confuse it, or keep them)
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          content: m.text
        }));
      
      // Append the new message to the history we send
      history.push({ role: 'user', content: userMessage.text });

      // Reset textarea height
      const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
      if (textarea) textarea.style.height = 'auto';

      const response = await apiPost<any>('/api/schedule/chat', {
        messages: history,
        date: today
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        title: response.status === 'draft' ? 'Draft Schedule Proposed' : (response.status === 'approved' ? 'Schedule Approved!' : undefined),
        text: response.reply,
        status: response.status,
        tasks: response.draftTasks || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.status === 'approved' && response.tasks?.length) {
        updateTasks([...tasks, ...response.tasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
      }
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
    <div className="w-full h-full bg-[#000000] border-l border-[#262626] flex flex-col z-40">
      {/* Header */}
      <div className="h-14 border-b border-[#262626] flex items-center justify-between px-4 shrink-0 bg-[#000000]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <span className="font-mono text-[11px] uppercase tracking-wide text-white">Gemini Core</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="text-[#666] hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#666]">{isProcessing ? 'PROCESSING' : 'IDLE'}</span>
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[#FFFF00] animate-pulse' : 'bg-green-500'}`} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: any) => (
          <div key={msg.id} className={`flex flex-col gap-1 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <>
                <div className="bg-[#1A1A1A] text-white p-3 text-sm max-w-[90%] border border-[#262626] rounded-none">
                  {msg.text}
                </div>
                <span className="font-mono text-[10px] text-gray-500">{msg.timestamp}</span>
              </>
            ) : (
              <>
                <div className="bg-[#121212] border border-[#262626] border-l-2 border-l-[#FFFF00] p-4 text-sm w-full flex flex-col gap-2 rounded-none">
                  {msg.title && (
                    <div className="font-bold text-white text-[13px]">
                      {msg.title}
                    </div>
                  )}
                  <div className="text-gray-400 text-xs leading-relaxed">
                    {msg.text}
                  </div>
                  
                  {msg.status === 'draft' && msg.tasks && msg.tasks.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-[#262626] pt-3">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Proposed Tasks:</div>
                      {msg.tasks.map((t: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 bg-[#1A1A1A] p-2 border border-[#262626]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{t.title}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{t.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                            {t.fixedStartTime ? (
                              <span>@ {format(new Date(t.fixedStartTime), 'h:mm a')}</span>
                            ) : (
                              <span>Fluid</span>
                            )}
                            <span>· {t.durationMinutes}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#262626] shrink-0 bg-[#000000]">
        <div className="relative flex items-end">
          <textarea 
            id="chat-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            className="w-full bg-[#121212] border border-[#262626] text-white pr-10 pl-3 py-3 font-mono text-xs focus-visible:outline-none focus-visible:border-[#FFFF00] rounded-none resize-none overflow-y-auto min-h-[42px] max-h-[150px] leading-relaxed transition-colors placeholder:text-[#666] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            placeholder="Command Gemini..."
            disabled={isProcessing}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="absolute right-1 bottom-1 text-[#888] hover:text-[#FFFF00] hover:bg-transparent disabled:opacity-50 disabled:bg-transparent"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
