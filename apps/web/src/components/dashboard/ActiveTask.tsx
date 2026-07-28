'use client'

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@pulse/ui';
import { CirclePlus } from 'lucide-react';

export function ActiveTask() {
  const [timeLeft, setTimeLeft] = useState(24 * 60 + 58); // 24:58

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <Card className="w-full flex flex-col items-center justify-center py-12 px-6 bg-[#121212] border-[#262626] rounded-none shadow-none">
      <div className="font-mono uppercase tracking-[0.3em] text-[#666] text-[11px] mb-8">
        Current Focus Block
      </div>
      
      <div className="font-mono text-[120px] font-bold text-[#FFFF00] leading-none mb-12 tracking-tight">
        {minutes}:{seconds}
      </div>

      <Button 
        className="bg-[#FFFF00] text-black hover:bg-white hover:text-black transition-none rounded-none px-8 py-6 flex items-center gap-3 font-semibold tracking-wide text-sm border-none shadow-none"
        onClick={() => setTimeLeft(prev => prev + 15 * 60)}
      >
        <CirclePlus className="w-5 h-5" />
        NEED MORE TIME (+15M)
      </Button>
    </Card>
  );
}
