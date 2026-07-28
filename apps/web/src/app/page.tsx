'use client'

import React, { useEffect, useState } from 'react';
import { ActiveTask } from '@/components/dashboard/ActiveTask';
import { UpcomingPipeline } from '@/components/dashboard/UpcomingPipeline';
import { AiChatPanel } from '@/components/dashboard/AiChatPanel';
import { apiGet } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await apiGet<{ tasks: any[] }>(`/api/tasks?date=${today}`);
        setTasks(res.tasks || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    
    fetchTasks();
  }, [token]);

  const activeTask = tasks.find(t => t.status === 'Running') || null;
  const upcomingTasks = tasks.filter(t => t.status === 'Upcoming' || t.status === 'Completed').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="min-h-screen bg-black text-white flex selection:bg-[#FFFF00] selection:text-black">
      {/* Main Content Area */}
      <div className="flex-1 pr-[320px] p-12">
        <div className="max-w-3xl mx-auto flex flex-col">
          {/* Blinking Cursor */}
          <div className="w-1 h-6 bg-[#FFFF00] animate-pulse mb-8" />
          
          <ActiveTask task={activeTask} />
          
          <UpcomingPipeline tasks={upcomingTasks} />
        </div>
      </div>

      {/* Right Sidebar */}
      <AiChatPanel setTasks={setTasks} />
    </div>
  );
}
