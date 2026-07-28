import React from 'react';
import { Lock, GripVertical } from 'lucide-react';

export function UpcomingPipeline() {
  return (
    <div className="w-full mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-mono uppercase tracking-[0.3em] text-[#666] text-[11px] shrink-0">
          Upcoming Pipeline
        </h2>
        <div className="h-px bg-[#262626] flex-1" />
      </div>

      <div className="flex flex-col gap-2">
        {/* Row 1 - Completed/Dimmed */}
        <div className="flex items-center justify-between p-4 opacity-50 bg-[#121212] border border-[#262626] rounded-none">
          <div className="flex items-center gap-6">
            <span className="font-mono text-gray-500 w-12 text-sm">10:00</span>
            <span className="text-gray-500 text-sm">Review Paging Concepts</span>
          </div>
          <Lock className="w-4 h-4 text-gray-500" />
        </div>

        {/* Row 2 - Active */}
        <div className="flex items-center justify-between p-4 bg-[#1a1a00] border border-[#262626] border-l-2 border-l-[#FFFF00] rounded-none">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[#FFFF00] w-12 text-sm">10:45</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-sm">Lab Report Draft</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#FFFF00] border border-[#FFFF00]/30 px-1.5 py-0.5 rounded-none">
                Anchor
              </span>
            </div>
          </div>
          <Lock className="w-4 h-4 text-[#FFFF00]" />
        </div>

        {/* Row 3 - Upcoming */}
        <div className="flex items-center justify-between p-4 bg-[#121212] border border-[#262626] rounded-none">
          <div className="flex items-center gap-6">
            <span className="font-mono text-gray-400 w-12 text-sm">11:30</span>
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">Quiz Prep: Scheduling</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded-none">
                Fluid
              </span>
            </div>
          </div>
          <div className="flex items-center text-gray-500">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
