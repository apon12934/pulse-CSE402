'use client'

import React from 'react';
import { Bot, CalendarDays, MousePointer2, ArrowRight, Zap, GripVertical, RefreshCw } from 'lucide-react';
import { cn } from '@pulse/ui';

export default function HelpPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-[#FFFF00] font-mono text-3xl font-bold tracking-widest uppercase mb-2 animate-fade-in-up">
            How to use Pulse
          </h1>
          <p className="text-[#888] font-mono text-base tracking-wide max-w-2xl leading-relaxed animate-fade-in-up delay-100">
            Welcome to the future of personal scheduling. Pulse is a highly dynamic, AI-powered timeline designed to adapt to your life in real-time. Here is everything you need to know.
          </p>
        </div>

        {/* Dynamic Timeline Section */}
        <div className="border border-[#262626] bg-[#121212] p-6 md:p-8 space-y-6 relative overflow-hidden group hover:border-[#FFFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFF00]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#FFFF00]/10 transition-colors" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black border border-[#262626] flex items-center justify-center shrink-0">
              <MousePointer2 className="w-5 h-5 text-[#FFFF00]" />
            </div>
            <div>
              <h2 className="text-white font-mono font-bold tracking-widest uppercase text-lg">Dynamic Timeline</h2>
              <p className="text-[#888] text-sm font-mono mt-1">Drag, drop, and watch the AI adapt.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#EDEDED] font-mono text-sm">
                <GripVertical className="w-4 h-4 text-[#FFFF00]" /> Moving Tasks
              </div>
              <p className="text-[#888] text-sm leading-relaxed">
                Click and hold the grip icon on any task to drag it to a new time. The AI will instantly recalculate the rest of your day, shifting other tasks forward or backward to accommodate the change.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#EDEDED] font-mono text-sm">
                <RefreshCw className="w-4 h-4 text-[#FFFF00]" /> Resizing Tasks
              </div>
              <p className="text-[#888] text-sm leading-relaxed">
                Need more time? Drag the bottom handle of a task to expand it. The AI will automatically shrink or push down subsequent tasks to make room, ensuring you never run out of hours in the day.
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Templates Section */}
        <div className="border border-[#262626] bg-[#121212] p-6 md:p-8 space-y-6 relative overflow-hidden group hover:border-[#FFFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFF00]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#FFFF00]/10 transition-colors" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black border border-[#262626] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-[#FFFF00]" />
            </div>
            <div>
              <h2 className="text-white font-mono font-bold tracking-widest uppercase text-lg">Weekly Templates</h2>
              <p className="text-[#888] text-sm font-mono mt-1">Set your routine on autopilot.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#EDEDED] font-mono text-sm">
                <div className="w-2 h-2 bg-[#FFFF00]" /> Anchor Tasks
              </div>
              <p className="text-[#888] text-sm leading-relaxed">
                Anchors are fixed in time (e.g., Classes, Meetings). They have strict start and end times. The AI respects these boundaries and will never move them unless you explicitly tell it to.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#EDEDED] font-mono text-sm">
                <div className="w-2 h-2 border border-[#FFFF00]" /> Fluid Tasks
              </div>
              <p className="text-[#888] text-sm leading-relaxed">
                Fluid tasks are flexible routines (e.g., Study, Gym, Lunch). You give them a default time, but they easily float around your anchors when the day gets crowded.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 border border-[#262626] bg-black">
            <p className="text-[#888] text-sm font-mono">
              <strong className="text-[#FFFF00]">Pro Tip:</strong> Click the "Apply Globally" checkbox when editing a task to automatically update its template for all future weeks.
            </p>
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="border border-[#262626] bg-[#121212] p-6 md:p-8 space-y-6 relative overflow-hidden group hover:border-[#FFFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFF00]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#FFFF00]/10 transition-colors" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black border border-[#262626] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#FFFF00]" />
            </div>
            <div>
              <h2 className="text-white font-mono font-bold tracking-widest uppercase text-lg">AI Chat Assistant</h2>
              <p className="text-[#888] text-sm font-mono mt-1">Draft your day naturally.</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[#888] text-sm leading-relaxed">
              Don't want to manually place blocks on the timeline? Just talk to the AI. Open the Chat Panel on the Dashboard and tell it what you want to do today.
            </p>
            <div className="flex flex-col gap-3">
              <div className="bg-[#1A1A1A] p-3 border border-[#333] font-mono text-sm text-[#EDEDED]">
                "I have an exam tomorrow. Clear my fluid tasks and schedule 4 hours of intense study blocks after my 2 PM anchor."
              </div>
              <div className="bg-[#1A1A1A] p-3 border border-[#333] font-mono text-sm text-[#EDEDED]">
                "I'm feeling low energy today. Shrink all my heavy study sessions and give me more breaks."
              </div>
            </div>
            <p className="text-[#888] text-sm leading-relaxed mt-4">
              The AI will read your current schedule, propose a drafted timeline, and let you review it before hitting "Approve".
            </p>
          </div>
        </div>

        {/* Energy Levels Section */}
        <div className="border border-[#262626] bg-[#121212] p-6 md:p-8 space-y-6 relative overflow-hidden group hover:border-[#FFFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFF00]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#FFFF00]/10 transition-colors" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black border border-[#262626] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#FFFF00]" />
            </div>
            <div>
              <h2 className="text-white font-mono font-bold tracking-widest uppercase text-lg">Energy Matching</h2>
              <p className="text-[#888] text-sm font-mono mt-1">Optimize your cognitive load.</p>
            </div>
          </div>

          <p className="text-[#888] text-sm leading-relaxed">
            Every task in Pulse requires an Energy Level (High, Medium, or Low). When the AI generates or reschedules your day, it tries to match your tasks to your natural circadian rhythm. It avoids stacking too many "High" energy tasks back-to-back, giving you the breathing room you need to stay productive without burning out.
          </p>
        </div>

      </div>
    </div>
  );
}
