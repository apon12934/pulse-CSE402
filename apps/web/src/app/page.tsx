'use client'

import React, { useEffect, useState } from 'react';
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
    fetchTasks(new Date());
  }, [token, fetchTasks]);

  const activeTask = tasks.find(t => t.status === 'Running') || null;
  const upcomingTasks = tasks.filter(t => t.status === 'Upcoming' || t.status === 'Completed').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="min-h-screen bg-black text-white flex selection:bg-[#FFFF00] selection:text-black">
      {/* Main Content Area */}
      <div className="flex-1 xl:pr-[320px] p-6 md:p-12 relative overflow-y-auto">
        {error && (
          <div className="absolute top-0 left-0 w-full bg-[#FF4444] text-white font-mono text-[10px] uppercase px-4 py-2 text-center tracking-widest z-50">
            SYS_ERR: {error}
          </div>
        )}
        <div className="max-w-3xl mx-auto flex flex-col pt-4">
          {/* Blinking Cursor */}
          <div className="w-1 h-6 bg-[#FFFF00] animate-pulse mb-8" />
          
          <ActiveTask task={activeTask} />
          
          <UpcomingPipeline tasks={upcomingTasks} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block">
        <AiChatPanel />
      </div>
    </div>
  );
}
