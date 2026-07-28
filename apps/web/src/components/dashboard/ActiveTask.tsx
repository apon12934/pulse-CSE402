'use client'

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@pulse/ui';
import { CirclePlus } from 'lucide-react';
import { apiPost } from '@/lib/api';

interface ActiveTaskProps {
  task: any | null;
}

export function ActiveTask({ task }: ActiveTaskProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!task) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(task.endTime).getTime();
      const diff = Math.floor((end - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [task]);

  const handleNeedMoreTime = async () => {
    if (!task) return;
    
    // Domino Effect Reschedule
    try {
      const newEndTime = new Date(new Date(task.endTime).getTime() + 15 * 60000).toISOString();
      await apiPost('/api/schedule/reschedule', {
        taskId: task.id,
        newEndTime,
      });
      // A proper implementation would trigger a re-fetch of the tasks here.
      // For now, we optimistically update the timer.
      setTimeLeft(prev => prev + 15 * 60);
      // Let dashboard refetch in a full implementation, or pass a callback
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  if (!task) {
    return (
      <Card className="w-full flex flex-col items-center justify-center py-12 px-6 bg-[#121212] border-[#262626] rounded-none shadow-none mb-12">
        <div className="font-mono uppercase tracking-[0.3em] text-[#666] text-[11px] mb-8">
          Current Focus Block
        </div>
        <div className="font-mono text-xl font-bold text-[#666] leading-none mb-12 tracking-tight">
          NO ACTIVE TASK
        </div>
      </Card>
    );
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <Card className="w-full flex flex-col items-center justify-center py-12 px-6 bg-[#121212] border-[#262626] rounded-none shadow-none mb-12">
      <div className="font-mono uppercase tracking-[0.3em] text-[#666] text-[11px] mb-8">
        Current Focus Block: {task.title}
      </div>
      
      <div className="font-mono text-[120px] font-bold text-[#FFFF00] leading-none mb-12 tracking-tight">
        {minutes}:{seconds}
      </div>

      <Button 
        className="bg-[#FFFF00] text-black hover:bg-white hover:text-black transition-none rounded-none px-8 py-6 flex items-center gap-3 font-semibold tracking-wide text-sm border-none shadow-none"
        onClick={handleNeedMoreTime}
      >
        <CirclePlus className="w-5 h-5" />
        NEED MORE TIME (+15M)
      </Button>
    </Card>
  );
}
