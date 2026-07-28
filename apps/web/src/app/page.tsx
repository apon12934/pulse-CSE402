'use client'

import React from 'react';
import { ActiveTask } from '@/components/dashboard/ActiveTask';
import { UpcomingPipeline } from '@/components/dashboard/UpcomingPipeline';
import { AiChatPanel } from '@/components/dashboard/AiChatPanel';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white flex selection:bg-[#FFFF00] selection:text-black">
      {/* Main Content Area */}
      <div className="flex-1 pr-[320px] p-12">
        <div className="max-w-3xl mx-auto flex flex-col">
          {/* Blinking Cursor */}
          <div className="w-1 h-6 bg-[#FFFF00] animate-pulse mb-8" />
          
          <ActiveTask />
          
          <UpcomingPipeline />
        </div>
      </div>

      {/* Right Sidebar */}
      <AiChatPanel />
    </div>
  );
}
