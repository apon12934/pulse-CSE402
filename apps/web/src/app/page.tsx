'use client';

import { ActiveTask } from '@/components/dashboard/ActiveTask';
import { UpcomingPipeline } from '@/components/dashboard/UpcomingPipeline';
import { AiChatPanel } from '@/components/dashboard/AiChatPanel';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black p-6 flex items-stretch gap-6">
      <div className="flex-1 flex flex-col gap-6 max-w-5xl">
        <div className="h-[360px]">
          <ActiveTask />
        </div>
        <div className="flex-1 min-h-[400px]">
          <UpcomingPipeline />
        </div>
      </div>
      <div className="w-96 flex-shrink-0 h-[calc(100vh-3rem)] sticky top-6">
        <AiChatPanel />
      </div>
    </div>
  );
}
