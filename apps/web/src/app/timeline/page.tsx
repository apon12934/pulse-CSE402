'use client';

import { useState, useEffect } from 'react';
import { Button, cn, Modal, Input, Select } from '@pulse/ui';
import { Lock, ChevronLeft, ChevronRight, GripVertical, Trash2, CalendarPlus } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTaskStore } from '@/store/tasks';
import { TimelineBlock } from '@/components/timeline/TimelineBlock';
import { EditTaskModal } from '@/components/shared/EditTaskModal';

/* ─── Time Grid Config ─────────────────────────── */
// We'll compute these dynamically inside the component now
const HOUR_HEIGHT = 80; // px per hour

// Removed inline time functions as they are now in TimelineBlock
function formatHour(h: number): string {
  const realH = h % 24;
  const ampm = realH >= 12 ? 'PM' : 'AM';
  const display = realH > 12 ? realH - 12 : realH === 0 ? 12 : realH;
  return `${display.toString().padStart(2, '0')}:00 ${ampm}`;
}

/* ─── Page Component ───────────────────────────── */
export default function TimelinePage() {
  const { tasks, fetchTasks, deleteTask, deleteTaskGlobally, clearDay, error: storeError } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [localError, setLocalError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [deletingTask, setDeletingTask] = useState<any | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const { token } = useAuthStore();

  useEffect(() => {
    fetchTasks(currentDate);
  }, [currentDate, token, fetchTasks]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'Fluid',
    energyLevel: 'Medium',
    priority: 1,
    startHour: '09:00',
    durationMinutes: 60,
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([new Date().getDay()]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTask.title) return;
    
    // Construct startTime and endTime based on currentDate + startHour
    const start = new Date(currentDate);
    const [h, m] = newTask.startHour.split(':').map(Number);
    start.setHours(h ?? 9, m ?? 0, 0, 0);
    
    const end = new Date(start.getTime() + newTask.durationMinutes * 60000);

    try {
      const payload: any = {
        title: newTask.title,
        type: newTask.type,
        energyLevel: newTask.energyLevel,
        priority: Number(newTask.priority),
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };

      if (isRecurring && recurringDays.length > 0) {
        payload.recurringDays = recurringDays;
        payload.localStartHour = h ?? 9;
        payload.localStartMinute = m ?? 0;
        payload.localEndHour = end.getHours();
        payload.localEndMinute = end.getMinutes();
        payload.timezoneOffset = new Date().getTimezoneOffset();
        payload.referenceDate = currentDate.toISOString().split('T')[0];
      }

      await apiPost('/api/tasks', payload);
      setIsCreateModalOpen(false);
      setNewTask({ title: '', type: 'Fluid', energyLevel: 'Medium', priority: 1, startHour: '09:00', durationMinutes: 60 });
      setIsRecurring(false);
      setRecurringDays([currentDate.getDay()]);
      await fetchTasks(currentDate);
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setLocalError(err.message || 'Failed to create task');
    }
  };

  // Dynamic Hour Range Calculation
  const [isReordering, setIsReordering] = useState(false);

  const handleTaskMove = async (block: any, newStartTimeISO: string) => {
    // Optimistic snap is handled inside TimelineBlock
    // If it fails, TimelineBlock will revert its local state
    const { apiPatch } = await import('@/lib/api');
    await apiPatch(`/api/schedule/reschedule`, { taskId: block.id, newStartTime: newStartTimeISO });
    fetchTasks(currentDate);
  };

  const handleDeleteClick = (block: any) => {
    if (block.templateTaskId) {
      setDeletingTask(block);
    } else {
      deleteTask(block.id);
    }
  };

  const getEffectiveHour = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    let h = d.getHours();
    const taskDate = new Date(d);
    taskDate.setHours(0, 0, 0, 0);
    const baseDate = new Date(currentDate);
    baseDate.setHours(0, 0, 0, 0);
    if (taskDate.getTime() > baseDate.getTime()) {
      h += 24;
    }
    return h;
  };

  const hourStart = tasks.length > 0 
    ? Math.max(0, Math.min(...tasks.map(t => getEffectiveHour(t.startTime))) - 1)
    : 8;
  const hourEnd = tasks.length > 0
    ? Math.max(23, Math.max(...tasks.map(t => getEffectiveHour(t.endTime))) + 1)
    : 23;
  
  const HOURS = Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i);
  const totalHeight = (hourEnd - hourStart + 1) * HOUR_HEIGHT;
  const dateLabel = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const error = storeError || localError;

  return (
    <div className="flex flex-col h-full gap-6 relative pt-8 pr-6">
      {error && (
        <div className="absolute top-0 left-0 w-full bg-[#FF4444] text-white font-mono text-[10px] uppercase px-4 py-2 text-center tracking-widest z-50">
          SYS_ERR: {error}
        </div>
      )}
      {/* ── Header Strip ──────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="pl-16">
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

          {tasks.length > 0 && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#666] hover:text-red-500 border border-[#262626] hover:border-red-500/50 px-3 py-2 transition-colors"
              title="Reset — restore tasks to your weekly template"
            >
              <Trash2 className="w-3.5 h-3.5" />
              RESET DAY
            </button>
          )}

          <Button variant="ghost" size="md" onClick={() => setIsCreateModalOpen(true)}>
            + NEW TASK
          </Button>
        </div>
      </div>

      {/* ── 1px yellow divider ────────────────── */}
      <div className="h-px w-full bg-[#FFFF00] shrink-0" />

      {/* ── Create Modal ──────────────────────── */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="CREATE NEW TASK">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-5">
          <Input 
            label="Task Title" 
            placeholder="e.g. Deep Work Session" 
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
            autoFocus
          />
          <Select 
            label="Energy Level" 
            value={newTask.energyLevel} 
            onChange={(e) => setNewTask({ ...newTask, energyLevel: e.target.value })}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Time" 
              type="time"
              value={newTask.startHour}
              onChange={(e) => setNewTask({ ...newTask, startHour: e.target.value })}
              required
            />
            <Input 
              label="Duration (mins)" 
              type="number"
              min="5"
              step="5"
              value={newTask.durationMinutes}
              onChange={(e) => setNewTask({ ...newTask, durationMinutes: parseInt(e.target.value) })}
              required
            />
          </div>
          <Input 
            label="Priority (1-10)" 
            type="number"
            min="1"
            max="10"
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
            required
          />

          <div className="flex flex-col gap-3 mt-2 bg-[#1A1A1A] p-4 border border-[#262626]">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-[#FFFF00] bg-[#262626] border-[#404040] rounded-sm cursor-pointer"
              />
              <div className="flex flex-col">
                <label htmlFor="isRecurring" className="text-xs font-bold text-white cursor-pointer">
                  Make this a recurring weekly task
                </label>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                  Adds this task to your base weekly routine
                </span>
              </div>
            </div>
            
            {isRecurring && (
              <div className="flex gap-2 mt-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                  const isSelected = recurringDays.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRecurringDays(prev => prev.filter(d => d !== i));
                        } else {
                          setRecurringDays(prev => [...prev, i].sort());
                        }
                      }}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center font-mono text-xs border transition-colors",
                        isSelected 
                          ? "bg-[#FFFF00] text-black border-[#FFFF00] font-bold" 
                          : "bg-[#262626] text-[#888] border-[#333] hover:border-[#666] hover:text-white"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="primary" type="submit" className="w-full mt-2">
            LOCK INTO TIMELINE
          </Button>
        </form>
      </Modal>

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
            {/* Current Time Indicator */}
            {currentDate.toDateString() === now.toDateString() && (() => {
              const h = now.getHours();
              const m = now.getMinutes();
              if (h < hourStart) return null;
              const topOffset = (h - hourStart + m / 60) * HOUR_HEIGHT;
              
              return (
                <div 
                  className="absolute left-0 w-full z-30 pointer-events-none flex items-center"
                  style={{ top: topOffset }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <div className="flex-1 h-px bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                </div>
              );
            })()}

            {/* Blocks */}
            {isReordering && (
              <div className="absolute inset-0 z-40 bg-[#121212]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="font-mono text-[10px] text-[#FFFF00] uppercase tracking-[0.2em] animate-pulse flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-ping" />
                  AI REBUILDING SCHEDULE...
                </div>
              </div>
            )}
            
            {tasks.map((block) => {
              const durationHours = (new Date(block.endTime).getTime() - new Date(block.startTime).getTime()) / 3600000;
              const baseZIndex = Math.max(1, Math.round(100 - durationHours * 10)); // Shorter tasks get higher z-index

              return (
                <TimelineBlock
                  key={block.id}
                  block={block}
                  hourStart={hourStart}
                  hourHeight={HOUR_HEIGHT}
                  totalHeight={totalHeight}
                  onDelete={handleDeleteClick}
                  onEdit={(block) => setEditingTask(block)}
                  onRefresh={() => fetchTasks(currentDate)}
                  onMove={handleTaskMove}
                  onError={(msg) => {
                    setLocalError(msg);
                    setTimeout(() => setLocalError(null), 5000);
                  }}
                  baseZIndex={baseZIndex}
                  currentDate={currentDate}
                />
              );
            })}

            {tasks.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border border-[#262626] flex items-center justify-center mb-4">
                  <CalendarPlus className="w-6 h-6 text-[#666]" />
                </div>
                <h3 className="font-sans text-xl text-white font-medium mb-2">No tasks scheduled</h3>
                <p className="font-mono text-xs text-[#666] uppercase tracking-widest max-w-sm leading-relaxed">
                  Use the Chat to build your AI routine, or click + New Task to add a block manually.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        currentDate={currentDate}
      />

      <Modal isOpen={!!deletingTask} onClose={() => setDeletingTask(null)} title="DELETE TASK">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            This task is part of your recurring weekly routine. Do you want to delete it just for today, or remove it from all future weeks as well?
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              variant="primary" 
              onClick={() => {
                if (deletingTask) deleteTask(deletingTask.id);
                setDeletingTask(null);
              }}
            >
              JUST THIS DAY
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-500 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
              onClick={() => {
                if (deletingTask) deleteTaskGlobally(deletingTask.id, deletingTask.templateTaskId);
                setDeletingTask(null);
              }}
            >
              ALL FUTURE WEEKS (GLOBALLY)
            </Button>
            <Button 
              variant="ghost" 
              className="mt-2 text-[#888]"
              onClick={() => setDeletingTask(null)}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="RESET DAY">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            Reset {dateLabel} back to your weekly routine? Any custom tasks or changes you made specifically for today will be lost.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              className="text-red-500 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
              onClick={async () => {
                await clearDay(currentDate);
                setIsResetModalOpen(false);
              }}
            >
              YES, RESET TODAY
            </Button>
            <Button 
              variant="ghost" 
              className="mt-2 text-[#888]"
              onClick={() => setIsResetModalOpen(false)}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
