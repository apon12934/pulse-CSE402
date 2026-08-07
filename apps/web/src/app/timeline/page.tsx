'use client';

import { useState, useEffect } from 'react';
import { Button, cn, Modal, Input, Select } from '@pulse/ui';
import { Lock, ChevronLeft, ChevronRight, GripVertical, Trash2, CalendarPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTaskStore } from '@/store/tasks';
import { TimelineBlock } from '@/components/timeline/TimelineBlock';
import { EditTaskModal } from '@/components/shared/EditTaskModal';

/* ─── Time Grid Config ─────────────────────────── */
// We'll compute these dynamically inside the component now
const HOUR_HEIGHT = 80; // px per hour

// Removed inline time functions as they are now in TimelineBlock
function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display.toString().padStart(2, '0')}:00 ${ampm}`;
}

/* ─── Page Component ───────────────────────────── */
export default function TimelinePage() {
  const { tasks, fetchTasks, deleteTask, error: storeError } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localError, setLocalError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchTasks(currentDate);
  }, [currentDate, token, fetchTasks]);


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'Anchor',
    energyLevel: 'Medium',
    priority: 1,
    startHour: '09:00',
    durationMinutes: 60,
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTask.title) return;
    
    // Construct startTime and endTime based on currentDate + startHour
    const start = new Date(currentDate);
    const [h, m] = newTask.startHour.split(':').map(Number);
    start.setHours(h ?? 9, m ?? 0, 0, 0);
    
    const end = new Date(start.getTime() + newTask.durationMinutes * 60000);

    try {
      await apiPost('/api/tasks', {
        title: newTask.title,
        type: newTask.type,
        energyLevel: newTask.energyLevel,
        priority: Number(newTask.priority),
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      setIsCreateModalOpen(false);
      setNewTask({ title: '', type: 'Anchor', energyLevel: 'Medium', priority: 1, startHour: '09:00', durationMinutes: 60 });
      await fetchTasks(currentDate);
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setLocalError(err.message || 'Failed to create task');
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
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Type" 
              value={newTask.type} 
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
            >
              <option value="Anchor">Anchor (Fixed)</option>
              <option value="Fluid">Fluid (AI Flexible)</option>
            </Select>
            <Select 
              label="Energy Level" 
              value={newTask.energyLevel} 
              onChange={(e) => setNewTask({ ...newTask, energyLevel: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </div>
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

            {tasks.map((block) => (
              <TimelineBlock
                key={block.id}
                block={block}
                hourStart={hourStart}
                hourHeight={HOUR_HEIGHT}
                totalHeight={totalHeight}
                onDelete={deleteTask}
                onEdit={setEditingTask}
                onRefresh={() => fetchTasks(currentDate)}
              />
            ))}

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
    </div>
  );
}
