"use client";

import { Card, Button } from "@pulse/ui";
import { Zap, Settings, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full bg-[#000000] text-white p-8 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 border-b border-[#262626] pb-4">
        <div className="text-[#FFFF00] font-mono text-[11px] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FFFF00] inline-block"></span>
          PULSE ANALYTICS MODULE
        </div>
        <div className="flex items-center gap-4 text-[#888]">
          <Zap className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Header Section */}
      <div className="mb-10">
        <h1 className="font-sans text-[36px] font-semibold tracking-tight">Performance Overview</h1>
        <p className="font-sans text-[#888] mt-1 text-sm">Real-time execution metrics and behavioral analysis.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Card className="p-6 bg-[#121212] border-[#262626] flex flex-col justify-between min-h-[160px]">
          <h2 className="font-mono text-[11px] text-[#888] uppercase tracking-wide">EXECUTION RATE</h2>
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-[#FFFF00] text-[64px] font-medium leading-none">92</span>
              <span className="text-[#FFFF00] text-xl ml-1">%</span>
            </div>
          </div>
          <div className="w-full h-1 bg-[#262626] mt-6 flex">
            <div className="h-full bg-[#FFFF00] w-[92%]"></div>
          </div>
        </Card>

        <Card className="p-6 bg-[#121212] border-[#262626] flex flex-col justify-between min-h-[160px]">
          <h2 className="font-mono text-[11px] text-[#888] uppercase tracking-wide">DOMINO TRIGGERS</h2>
          <div className="mt-4">
            <span className="text-white text-[64px] font-medium leading-none">3</span>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <div className="h-2 w-8 bg-[#FFFF00]"></div>
            <div className="h-2 w-8 bg-[#FFFF00]"></div>
            <div className="h-2 w-8 bg-[#262626]"></div>
          </div>
        </Card>

        <Card className="p-6 bg-[#121212] border-[#262626] flex flex-col justify-between min-h-[160px]">
          <h2 className="font-mono text-[11px] text-[#888] uppercase tracking-wide">PEAK FLOW STATE</h2>
          <div className="mt-4 flex flex-col">
            <span className="text-white text-[28px] font-medium leading-none">10:00 AM</span>
            <span className="text-[#888] text-sm mt-1">to 1:00 PM</span>
          </div>
          <div className="mt-6 font-mono text-[11px] text-[#FFFF00] uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FFFF00] inline-block"></span>
            OPTIMAL WINDOW DETECTED
          </div>
        </Card>
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-10 gap-8">
        {/* Left Column - 60% */}
        <div className="col-span-6">
          <div className="flex justify-between items-end border-b border-[#262626] pb-2 mb-6">
            <h3 className="font-mono text-[11px] text-[#888] uppercase tracking-wide">PLANNED VS. ACTUAL ALLOCATION</h3>
            <div className="flex items-center gap-4 font-mono text-[10px] text-[#888] uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#444] inline-block"></span> PLANNED
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#FFFF00] inline-block"></span> ACTUAL
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="pb-6 border-b border-[#262626]">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[11px] text-white uppercase tracking-wide">ACADEMIC</span>
                <span className="font-mono text-[11px] text-[#888]">24h / 18h</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="w-full bg-[#262626] h-2 flex"><div className="bg-[#FFFF00] w-[100%]"></div></div>
                <div className="w-full bg-[#262626] h-2 flex"><div className="bg-[#444] w-[75%]"></div></div>
              </div>
            </div>

            <div className="pb-6 border-b border-[#262626]">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[11px] text-white uppercase tracking-wide">FREELANCE DESIGN</span>
                <span className="font-mono text-[11px] text-[#888]">15h / 22h</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="w-full bg-[#262626] h-2 flex"><div className="bg-[#FFFF00] w-[68%]"></div></div>
                <div className="w-full bg-[#262626] h-2 flex"><div className="bg-[#444] w-[100%]"></div></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[11px] text-white uppercase tracking-wide">ADMIN / OPS</span>
                <span className="font-mono text-[11px] text-[#888]">5h / 4h</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="w-full bg-[#262626] h-2 flex"><div className="bg-[#FFFF00] w-[25%]"></div></div>
                <div className="w-full bg-[#262626] h-2 flex"><div className="bg-[#444] w-[20%]"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 40% */}
        <div className="col-span-4">
          <Card className="p-6 bg-[#121212] border-[#FFFF00] h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-mono text-[11px] text-[#FFFF00] uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  SYSTEM INSIGHT
                </h3>
              </div>
              <p className="font-sans text-[#ccc] text-sm leading-relaxed">
                Pattern detected: Freelance design tasks consistently exceed planned estimates by an average of <strong className="text-[#FFFF00] font-normal">46%</strong>.
              </p>
              <p className="font-sans text-[#888] text-sm leading-relaxed mt-4">
                Recommendation: Increase baseline buffer for design tasks or review current estimation protocol.
              </p>
            </div>
            
            <Button variant="primary" className="w-full mt-8 rounded-none">
              APPLY CALIBRATION
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
