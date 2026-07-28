'use client';

import { useState, useEffect } from 'react';
import { Button, cn } from '@pulse/ui';
import { Lock, ChevronLeft, ChevronRight, GripVertical, Sparkles } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

/* ─── Time Grid Config ─────────────────────────── */
const HOUR_START = 8;
const HOUR_END = 23;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const HOUR_HEIGHT = 80; // px per hour

function timeToOffset(dateString: string): number {
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes();
  return (h - HOUR_START + m / 60) * HOUR_HEIGHT;
}

function timeToHeight(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return ((end.getTime() - start.getTime()) / 3600000) * HOUR_HEIGHT;
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display.toString().padStart(2, '0')}:00 ${ampm}`;
}

function formatTimeRange(startStr: string, endStr: string): string {
  const fmt = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${fmt(new Date(startStr))} — ${fmt(new Date(endStr))}`;
}

/* ─── Page Component ───────────────────────────── */
export default function TimelinePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const { token } = useAuthStore();

  const fetchTasks = async (date: Date) => {
    if (!token) return;
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await apiGet<{ tasks: any[] }>(`/api/tasks?date=${dateStr}`);
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks(currentDate);
  }, [currentDate, token]);

  const handleGenerate = async () => {
    if (!token) return;
    setIsGenerating(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const res = await apiPost<{ schedule: any[] }>('/api/schedule/generate', {
        date: dateStr,
        energyLevel: 'Medium'
      });
      // Refresh tasks
      await fetchTasks(currentDate);
    } catch (err) {
      console.error('Failed to generate schedule:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;
  const dateLabel = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
            <button 
              className="text-[#888] hover:text-[#FFFF00] transition-colors duration-150"
              onClick={() => {
                const prev = new Date(currentDate);
                prev.setDate(prev.getDate() - 1);
                setCurrentDate(prev);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[12px] uppercase tracking-[0.05em] text-white min-w-[160px] text-center">
              {dateLabel}
            </span>
            <button 
              className="text-[#888] hover:text-[#FFFF00] transition-colors duration-150"
              onClick={() => {
                const next = new Date(currentDate);
                next.setDate(next.getDate() + 1);
                setCurrentDate(next);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" size="md" onClick={handleGenerate} disabled={isGenerating}>
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'GENERATING...' : 'GENERATE AI ROUTINE'}
          </Button>
        </div>
      </div>

      {/* ── 1px yellow divider ────────────────── */}
      <div className="h-px w-full bg-[#FFFF00] shrink-0" />

      {/* ── Grid ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
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
            {tasks.map((block) => {
              const top = timeToOffset(block.startTime);
              const height = timeToHeight(block.startTime, block.endTime);
              const isFluid = block.type === 'Fluid';

              // Prevent rendering blocks outside visible hours
              if (top < 0 || top > totalHeight) return null;

              return (
                <div
                  key={block.id}
                  className="absolute left-3 right-3"
                  style={{ top, height: Math.max(height, 40) }} // min height
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
                        </span>
                        <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.05em]">
                          {formatTimeRange(block.startTime, block.endTime)}
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
                    {isFluid && height > 60 && (
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
