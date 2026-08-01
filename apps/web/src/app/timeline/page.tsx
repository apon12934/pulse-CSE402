'use client';

import { useState, useEffect } from 'react';
import { Button, cn } from '@pulse/ui';
import { Lock, ChevronLeft, ChevronRight, GripVertical, Sparkles, Trash2 } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTaskStore } from '@/store/tasks';

/* ─── Time Grid Config ─────────────────────────── */
// We'll compute these dynamically inside the component now
const HOUR_HEIGHT = 80; // px per hour

function timeToOffset(dateString: string, hourStart: number): number {
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes();
  return (h - hourStart + m / 60) * HOUR_HEIGHT;
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
  const { tasks, fetchTasks, deleteTask, error: storeError } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchTasks(currentDate);
  }, [currentDate, token, fetchTasks]);

  const handleGenerate = async () => {
    if (!token) return;
    setIsGenerating(true);
    setLocalError(null);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const res = await apiPost<{ schedule: any[] }>('/api/schedule/generate', {
        date: dateStr,
        energyLevel: 'Medium'
      });
      // Refresh tasks
      await fetchTasks(currentDate);
    } catch (err: any) {
      console.error('Failed to generate schedule:', err);
      setLocalError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic Hour Range Calculation
  const hourStart = tasks.length > 0 
    ? Math.max(0, Math.min(...tasks.map(t => new Date(t.startTime).getHours())) - 1)
    : 8;
  const hourEnd = tasks.length > 0
    ? Math.min(23, Math.max(...tasks.map(t => new Date(t.endTime).getHours())) + 1)
    : 23;
  
  const HOURS = Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i);
  const totalHeight = (hourEnd - hourStart + 1) * HOUR_HEIGHT;
  const dateLabel = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const error = storeError || localError;

  return (
    <div className="flex flex-col h-full gap-6 relative">
      {error && (
        <div className="absolute top-0 left-0 w-full bg-[#FF4444] text-white font-mono text-[10px] uppercase px-4 py-2 text-center tracking-widest z-50">
          SYS_ERR: {error}
        </div>
      )}
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
                style={{ top: (h - hourStart) * HOUR_HEIGHT }}
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
                style={{ top: (h - hourStart) * HOUR_HEIGHT }}
              />
            ))}

            {tasks.map((block) => {
              const top = timeToOffset(block.startTime, hourStart);
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
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTask(block.id); }}
                          className="ml-2 text-[#555] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

            {tasks.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border border-[#262626] rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#666]" />
                </div>
                <h3 className="font-sans text-xl text-white font-medium mb-2">No tasks scheduled</h3>
                <p className="font-mono text-xs text-[#666] uppercase tracking-widest max-w-sm leading-relaxed">
                  Generate an AI routine or manually add anchor blocks to begin your day.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
