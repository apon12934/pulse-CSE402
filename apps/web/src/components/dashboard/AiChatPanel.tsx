'use client'

import React, { useState } from 'react';
import { Bot, SendHorizontal } from 'lucide-react';
import { Input, Button } from '@pulse/ui';
import { apiPost } from '@/lib/api';

import { useTaskStore } from '@/store/tasks';

export function AiChatPanel() {
  const { tasks, updateTasks } = useTaskStore();
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'init',
      role: 'ai',
      text: 'Gemini Core initialized. Ready for scheduling directives.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiPost<any>('/api/schedule/chat', {
        message: userMessage.text,
        date: today
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        title: `Parsed ${response.tasksCreated} task(s).`,
        text: `Energy level interpreted as: ${response.parsedEnergyLevel}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      // Optimistically append the newly created tasks
      updateTasks([...tasks, ...response.tasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    } catch (err) {
      console.error('Failed to chat:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        title: 'Error processing directive.',
        text: 'Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-[320px] h-screen fixed right-0 top-0 border-l border-[#262626] bg-[#000000] flex flex-col z-10 rounded-none">
      {/* Header */}
      <div className="h-14 border-b border-[#262626] flex items-center justify-between px-4 shrink-0 bg-[#000000]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <span className="font-mono text-[11px] uppercase tracking-wide text-white">Gemini Core</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#666]">{isProcessing ? 'PROCESSING' : 'IDLE'}</span>
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[#FFFF00] animate-pulse' : 'bg-green-500'}`} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {messages.map((msg) => (
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
                  <div className="text-gray-400 text-xs">
                    {msg.text}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#FFFF00]">SYSTEM · {msg.timestamp}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#262626] shrink-0 bg-[#000000]">
        <div className="relative flex items-center">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-[#121212] border-[#262626] text-white pr-10 font-mono text-xs focus-visible:ring-0 focus-visible:border-[#FFFF00] rounded-none"
            placeholder="Command Gemini..."
            disabled={isProcessing}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2 text-[#888] hover:text-[#FFFF00] disabled:opacity-50"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
