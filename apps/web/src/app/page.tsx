'use client'

import { useState, useEffect } from 'react';
import { ActiveTask } from '@/components/dashboard/ActiveTask';
import { UpcomingPipeline } from '@/components/dashboard/UpcomingPipeline';
import { AiChatPanel } from '@/components/dashboard/AiChatPanel';
import { apiGet } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

import { useTaskStore } from '@/store/tasks';

export default function DashboardPage() {
  const { tasks, fetchTasks, error } = useTaskStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    
    // Initial fetch
    fetchTasks(new Date());

    // Background polling every 30 seconds to keep clients in sync
    const interval = setInterval(() => {
      fetchTasks(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [token, fetchTasks]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTask = tasks.find(t => 
    t.status !== 'Completed' && 
    new Date(t.startTime).getTime() <= currentTime.getTime() && 
    new Date(t.endTime).getTime() > currentTime.getTime()
  ) || null;

  const upcomingTasks = tasks
    .filter(t => t.status !== 'Completed' && new Date(t.endTime).getTime() > currentTime.getTime())
    .filter(t => activeTask ? t.id !== activeTask.id : true)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="h-full bg-black text-white selection:bg-[#FFFF00] selection:text-black">
      <div className="h-full p-6 md:p-12 relative overflow-y-auto">
        {error && (
          <div className="absolute top-0 left-0 w-full bg-[#FF4444] text-white font-mono text-[10px] uppercase px-4 py-2 text-center tracking-widest z-50">
            SYS_ERR: {error}
          </div>
        )}
        <div className="max-w-3xl mx-auto flex flex-col pt-4">
          {/* Blinking Cursor */}
          <div className="w-1 h-6 bg-[#FFFF00] animate-pulse mb-8" />
          
          <ActiveTask task={activeTask} nextTask={upcomingTasks[0] || null} />
          
          <UpcomingPipeline tasks={upcomingTasks} />
        </div>
      </div>
    </div>
  );
}
