'use client';

import { useState, useEffect } from 'react';
import { Card, StatusChip, Button, cn } from '@pulse/ui';

export function ActiveTask() {
  const [timeLeft, setTimeLeft] = useState(1 * 3600 + 23 * 60 + 45); // 1h 23m 45s

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = 2 * 3600; // arbitrary total time
  const progressPercent = Math.max(0, Math.min(100, 100 - (timeLeft / totalTime) * 100));
  const steppedProgress = Math.round(progressPercent / 5) * 5;

  return (
    <Card elevated className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#A3A3A3] font-mono text-xs uppercase tracking-widest">ACTIVE EXECUTION</h2>
        <StatusChip status="running" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-6 py-4">
        <h3 className="text-[32px] font-semibold text-white leading-tight font-sans">
          CSE323 — Data Structures Review
        </h3>
        
        <div className="flex flex-col gap-2">
          <div className="text-[64px] font-mono tabular-nums text-[#FFFF00] leading-none">
            {formatTime(timeLeft)}
          </div>
          <div className="w-full h-[2px] bg-[#262626] mt-4 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-[#FFFF00] transition-all duration-1000 ease-linear"
              style={{ width: `${steppedProgress}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col gap-3">
        <Button variant="primary" size="lg" className="w-full">
          NEED MORE TIME (+15M)
        </Button>
        <div className="text-center">
          <span className="text-[#A3A3A3] font-mono text-[10px] uppercase tracking-wider">
            DOMINO EFFECT: Remaining tasks will be recalculated
          </span>
        </div>
      </div>
    </Card>
  );
}
