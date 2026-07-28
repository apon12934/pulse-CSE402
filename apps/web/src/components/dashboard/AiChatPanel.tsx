'use client'

import React from 'react';
import { Bot, SendHorizontal } from 'lucide-react';
import { Input, Button } from '@pulse/ui';

export function AiChatPanel() {
  return (
    <div className="w-[320px] h-screen fixed right-0 top-0 border-l border-[#262626] bg-[#000000] flex flex-col z-10 rounded-none">
      {/* Header */}
      <div className="h-14 border-b border-[#262626] flex items-center justify-between px-4 shrink-0 bg-[#000000]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <span className="font-mono text-[11px] uppercase tracking-wide text-white">Gemini Core</span>
        </div>
        <div className="w-2 h-2 bg-green-500" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        {/* User Message */}
        <div className="flex flex-col gap-1 items-end w-full">
          <div className="bg-[#1A1A1A] text-white p-3 text-sm max-w-[90%] border border-[#262626] rounded-none">
            Lecture ran 20m over. Need to adjust.
          </div>
          <span className="font-mono text-[10px] text-gray-500">10:48 AM</span>
        </div>

        {/* AI Message */}
        <div className="flex flex-col gap-1 items-start w-full">
          <div className="bg-[#121212] border border-[#262626] border-l-2 border-l-[#FFFF00] p-4 text-sm w-full flex flex-col gap-2 rounded-none">
            <div className="font-bold text-white text-[13px]">
              Shifted study block by 20m to absorb lecture delay.
            </div>
            <div className="text-gray-400 text-xs">
              Pushed "Quiz Prep" fluid block to 11:30 AM to maintain Anchor integrity.
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#FFFF00]">SYSTEM · 10:42 AM</span>
        </div>

      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#262626] shrink-0 bg-[#000000]">
        <div className="relative flex items-center">
          <Input 
            className="w-full bg-[#121212] border-[#262626] text-white pr-10 font-mono text-xs focus-visible:ring-0 focus-visible:border-[#FFFF00] rounded-none"
            placeholder="Command Gemini..."
          />
          <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 px-2 text-[#888] hover:text-[#FFFF00]">
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
