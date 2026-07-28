'use client';

import { useState } from 'react';
import { Button, cn } from '@pulse/ui';
import { Lock, ChevronLeft, ChevronRight, GripVertical, Sparkles } from 'lucide-react';

/* ─── Time Grid Config ─────────────────────────── */
const HOUR_START = 8;
const HOUR_END = 20;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const HOUR_HEIGHT = 80; // px per hour

function timeToOffset(hour: number, minute: number): number {
  return (hour - HOUR_START + minute / 60) * HOUR_HEIGHT;
}

function timeToHeight(startH: number, startM: number, endH: number, endM: number): number {
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  return ((endMin - startMin) / 60) * HOUR_HEIGHT;
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display.toString().padStart(2, '0')}:00 ${ampm}`;
}

/* ─── Block Data ───────────────────────────────── */
type TimeBlock = {
  title: string;
  type: 'Anchor' | 'Fluid';
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  room?: string;
};

const BLOCKS: TimeBlock[] = [
  {
    title: 'Fairway Aquatica Layout Revision',
    type: 'Fluid',
    startH: 10,
    startM: 0,
    endH: 12,
    endM: 0,
  },
  {
    title: 'MAT229',
    type: 'Anchor',
    startH: 12,
    startM: 35,
    endH: 13,
    endM: 45,
    room: '510',
  },
  {
    title: 'CSE323',
    type: 'Anchor',
    startH: 13,
    startM: 50,
    endH: 15,
    endM: 0,
    room: '510',
  },
  {
    title: 'EEE206',
    type: 'Anchor',
    startH: 15,
    startM: 5,
    endH: 17,
    endM: 30,
    room: '513',
  },
];

/* ─── Format Time Range ────────────────────────── */
function formatTimeRange(b: TimeBlock): string {
  const fmt = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${dh}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${fmt(b.startH, b.startM)} — ${fmt(b.endH, b.endM)}`;
}

/* ─── Page Component ───────────────────────────── */
export default function TimelinePage() {
  const [dateLabel] = useState('Sunday, April 5th');

  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* ── Header Strip ──────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[28px] font-semibold text-white font-sans leading-tight">
            Timeline Manager
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#666] mt-1">
            VERTICAL TIME-BLOCK GRID
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2 border border-[#262626] px-3 py-2">
            <button className="text-[#888] hover:text-[#FFFF00] transition-colors duration-150">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[12px] uppercase tracking-[0.05em] text-white min-w-[160px] text-center">
              {dateLabel}
            </span>
            <button className="text-[#888] hover:text-[#FFFF00] transition-colors duration-150">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" size="md">
            <Sparkles className="w-4 h-4 mr-2" />
            GENERATE AI ROUTINE
          </Button>
        </div>
      </div>

      {/* ── 1px yellow divider ────────────────── */}
      <div className="h-px w-full bg-[#FFFF00] shrink-0" />

      {/* ── Grid ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex" style={{ minHeight: totalHeight }}>
          {/* Hour labels column */}
          <div className="w-20 shrink-0 relative" style={{ height: totalHeight }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-0 pr-3 flex items-start"
                style={{ top: (h - HOUR_START) * HOUR_HEIGHT }}
              >
                <span className="font-mono text-[10px] text-[#555] uppercase tracking-wider leading-none -translate-y-1/2">
                  {formatHour(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Grid + Blocks column */}
          <div className="flex-1 relative border-l border-[#1a1a1a]" style={{ height: totalHeight }}>
            {/* Horizontal hour lines */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 w-full border-t border-[#1a1a1a]"
                style={{ top: (h - HOUR_START) * HOUR_HEIGHT }}
              />
            ))}

            {/* Time Blocks */}
            {BLOCKS.map((block, i) => {
              const top = timeToOffset(block.startH, block.startM);
              const height = timeToHeight(block.startH, block.startM, block.endH, block.endM);
              const isFluid = block.type === 'Fluid';

              return (
                <div
                  key={i}
                  className="absolute left-3 right-3"
                  style={{ top, height }}
                >
                  <div
                    className={cn(
                      'h-full w-full px-4 py-3 flex flex-col justify-between transition-colors duration-150',
                      isFluid
                        ? 'border border-dashed border-[#FFFF00]/60 bg-[#FFFF00]/[0.03] hover:bg-[#FFFF00]/[0.06]'
                        : 'border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A]',
                    )}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          'font-sans text-[15px] font-semibold leading-tight',
                          isFluid ? 'text-[#FFFF00]' : 'text-[#999]',
                        )}>
                          {block.title}
                          {block.room && (
                            <span className="text-[#555] font-normal"> ({block.room})</span>
                          )}
                        </span>
                        <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.05em]">
                          {formatTimeRange(block)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          'font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border',
                          isFluid
                            ? 'text-[#FFFF00] border-[#FFFF00]/40'
                            : 'text-[#666] border-[#333]',
                        )}>
                          {block.type === 'Fluid' ? 'FLUID' : 'ANCHOR'}
                        </span>
                        {isFluid ? (
                          <GripVertical className="w-3.5 h-3.5 text-[#555]" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-[#555]" />
                        )}
                      </div>
                    </div>

                    {/* Bottom accent bar for Fluid blocks */}
                    {isFluid && (
                      <div className="flex items-center gap-2 mt-auto">
                        <div className="h-px flex-1 bg-[#FFFF00]/20" />
                        <span className="font-mono text-[9px] text-[#FFFF00]/50 uppercase tracking-widest">
                          AI-FLEXIBLE
                        </span>
                        <div className="h-px flex-1 bg-[#FFFF00]/20" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
