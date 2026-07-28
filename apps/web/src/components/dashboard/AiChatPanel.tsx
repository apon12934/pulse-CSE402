'use client';

import { useState } from 'react';
import { Card, Input, Button, cn } from '@pulse/ui';

export function AiChatPanel() {
  const [messages] = useState([
    {
      id: 1,
      role: 'user',
      content: "I'm feeling low energy today, reschedule my afternoon",
    },
    {
      id: 2,
      role: 'ai',
      content: "Understood. Moved Algorithm Practice to tomorrow. Replaced with light reading block.",
    },
    {
      id: 3,
      role: 'user',
      content: "Add a 30min break after EEE206",
    },
    {
      id: 4,
      role: 'ai',
      content: "Done. Break scheduled 16:00-16:30. Remaining tasks shifted.",
    },
  ]);

  const headerNode = (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-none bg-[#FFFF00]" />
      <span className="font-mono text-xs text-[#A3A3A3] tracking-widest uppercase">GEMINI CORE</span>
    </div>
  );

  return (
    <Card className="h-full flex flex-col w-full overflow-hidden !p-0">
      <div className="p-4 border-b border-[#262626] bg-[#121212]">
        {headerNode}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#121212]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "p-3 text-sm font-sans max-w-[85%]",
              msg.role === 'user' 
                ? "bg-[#1A1A1A] text-white self-end border border-[#262626]" 
                : "bg-[#121212] text-[#E5E5E5] self-start border-l-2 border-l-[#FFFF00] border-y border-r border-[#262626]"
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="border-t border-[#262626] p-4 bg-[#121212]">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input variant="outlined" placeholder="Ask Pulse anything..." />
          </div>
          <Button variant="primary" size="sm" className="px-4 shrink-0">SEND</Button>
        </div>
      </div>
    </Card>
  );
}
