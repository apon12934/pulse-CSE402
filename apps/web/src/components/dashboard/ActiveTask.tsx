'use client'

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@pulse/ui';
import { CirclePlus, CheckCircle2, Play, Clock } from 'lucide-react';
import { apiPost, apiPatch } from '@/lib/api';
import { useTaskStore } from '@/store/tasks';

interface ActiveTaskProps {
  task: any | null;
  nextTask?: any | null;
}

export function ActiveTask({ task, nextTask }: ActiveTaskProps) {
  const { fetchTasks } = useTaskStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!task) {
      if (nextTask) {
        // Calculate countdown to next task
        const calculateNextTaskCountdown = () => {
          const now = new Date().getTime();
          const start = new Date(nextTask.startTime).getTime();
          const diff = Math.floor((start - now) / 1000);
          return diff > 0 ? diff : 0;
        };
        setTimeLeft(calculateNextTaskCountdown());
      } else {
        setTimeLeft(0);
      }
      setProgress(0);
      return;
    }

    const calculateMetrics = () => {
      const now = new Date().getTime();
      const start = new Date(task.startTime).getTime();
      const end = new Date(task.endTime).getTime();
      
      const diff = Math.floor((end - now) / 1000);
      const total = end - start;
      const elapsed = now - start;
      const progressPct = Math.min(Math.max((elapsed / total) * 100, 0), 100);

      setTimeLeft(diff > 0 ? diff : 0);
      setProgress(progressPct);
    };

    calculateMetrics();

    const timer = setInterval(() => {
      calculateMetrics();
    }, 1000);
    return () => clearInterval(timer);
  }, [task, nextTask]);

  const handleNeedMoreTime = async () => {
    if (!task) return;
    try {
      const newEndTime = new Date(new Date(task.endTime).getTime() + 15 * 60000).toISOString();
      await apiPost('/api/schedule/reschedule', {
        taskId: task.id,
        newEndTime,
      });
      await fetchTasks(new Date());
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    try {
      // Mark complete and set endTime to exactly now
      await apiPatch(`/api/tasks/${task.id}`, {
        status: 'Completed',
        endTime: new Date().toISOString(),
      });
      await fetchTasks(new Date());
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleStartNextTask = async () => {
    if (!nextTask) return;
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const nowISO = new Date().toISOString();
      await apiPost('/api/schedule/move', { 
        taskId: nextTask.id, 
        newStartTime: nowISO,
        date: dateStr 
      });
      await fetchTasks(new Date());
    } catch (err) {
      console.error('Failed to start task:', err);
    }
  };

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    if (hours > 0) return `${hours}:${minutes}:${seconds}`;
    return `${minutes}:${seconds}`;
  };

  if (!task) {
    if (!nextTask) {
      return (
        <Card className="w-full flex flex-col items-center justify-center py-12 px-6 bg-[#121212] border-[#262626] rounded-none shadow-none mb-12">
          <div className="font-mono text-[#666] text-xs uppercase tracking-widest">
            ALL CAUGHT UP
          </div>
        </Card>
      );
    }

    return (
      <Card className="w-full flex flex-col py-8 px-8 bg-[#121212] border-[#262626] rounded-none shadow-none mb-12 relative overflow-hidden">
        <div className="font-mono uppercase tracking-[0.3em] text-[#FFFF00] text-[10px] mb-2 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          UP NEXT IN {formatCountdown(timeLeft)}
        </div>
        
        <div className="font-sans text-2xl font-bold text-white mb-6 truncate">
          {nextTask.title}
        </div>

        <div className="flex items-center gap-3">
          <Button 
            className="bg-white text-black hover:bg-[#FFFF00] hover:text-black transition-colors rounded-none px-6 py-4 flex items-center gap-2 font-mono tracking-widest text-xs border-none shadow-none"
            onClick={handleStartNextTask}
          >
            <Play className="w-4 h-4 fill-current" />
            START NOW
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full flex flex-col py-8 px-8 bg-[#121212] border-[#262626] rounded-none shadow-none mb-12 relative overflow-hidden">
      {/* Progress Bar Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#262626]" />
      {/* Progress Bar Fill */}
      <div 
        className="absolute top-0 left-0 h-1 bg-[#FFFF00] transition-all duration-1000 ease-linear" 
        style={{ width: `${progress}%` }} 
      />

      <div className="font-mono uppercase tracking-[0.3em] text-[#666] text-[10px] mb-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#FFFF00] animate-pulse" />
        NOW PLAYING
      </div>
      
      <div className="font-sans text-3xl font-bold text-white mb-2 truncate">
        {task.title}
      </div>

      <div className="font-mono text-4xl font-bold text-[#FFFF00] mb-8 tracking-tight">
        {formatCountdown(timeLeft)} <span className="text-[#666] text-sm tracking-widest uppercase">Remaining</span>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          className="bg-transparent border border-[#333] text-white hover:bg-[#333] hover:text-white transition-colors rounded-none px-6 py-5 flex items-center gap-2 font-mono tracking-widest text-xs shadow-none flex-1"
          onClick={handleCompleteTask}
        >
          <CheckCircle2 className="w-4 h-4" />
          MARK COMPLETE
        </Button>
        <Button 
          className="bg-[#1A1A1A] text-[#A3A3A3] hover:bg-[#262626] hover:text-white transition-colors rounded-none px-6 py-5 flex items-center gap-2 font-mono tracking-widest text-xs border-none shadow-none flex-1"
          onClick={handleNeedMoreTime}
        >
          <CirclePlus className="w-4 h-4" />
          NEED MORE TIME
        </Button>
      </div>
    </Card>
  );
}
