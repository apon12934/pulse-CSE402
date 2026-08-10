'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@pulse/ui';
import { useTaskStore } from '@/store/tasks';

interface EditTaskModalProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
}

function toLocalTimeInput(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function EditTaskModal({ task, isOpen, onClose, currentDate }: EditTaskModalProps) {
  const { updateTask } = useTaskStore();
  const [form, setForm] = useState({
    title: '',
    type: 'Anchor',
    energyLevel: 'Medium',
    priority: 1,
    startHour: '09:00',
    endHour: '10:00',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [applyGlobally, setApplyGlobally] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        type: task.type,
        energyLevel: task.energyLevel,
        priority: task.priority,
        startHour: toLocalTimeInput(task.startTime),
        endHour: toLocalTimeInput(task.endTime),
      });
      setApplyGlobally(false);
    }
  }, [task]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const start = new Date(currentDate);
    const [sh, sm] = form.startHour.split(':').map(Number);
    start.setHours(sh ?? 9, sm ?? 0, 0, 0);

    const end = new Date(currentDate);
    const [eh, em] = form.endHour.split(':').map(Number);
    end.setHours(eh ?? 10, em ?? 0, 0, 0);

    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: form.title,
        type: form.type,
        energyLevel: form.energyLevel,
        priority: Number(form.priority),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        localStartHour: sh ?? 9,
        localStartMinute: sm ?? 0,
        localEndHour: eh ?? 10,
        localEndMinute: em ?? 0,
        timezoneOffset: new Date().getTimezoneOffset(),
      }, currentDate, applyGlobally);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EDIT TASK">
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <Input
          label="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          autoFocus
        />
        <Select
          label="Energy Level"
          value={form.energyLevel}
          onChange={(e) => setForm({ ...form, energyLevel: e.target.value })}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Time"
            type="time"
            value={form.startHour}
            onChange={(e) => setForm({ ...form, startHour: e.target.value })}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={form.endHour}
            onChange={(e) => setForm({ ...form, endHour: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-widest">
              Priority Level <span className="text-white ml-2">{form.priority}/10</span>
            </label>
            <span className="font-mono text-[10px] text-[#666]">
              {form.priority === 10 ? 'CRITICAL' : form.priority <= 3 ? 'LOW' : ''}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-[#262626] rounded-none appearance-none cursor-pointer accent-[#FFFF00] hover:accent-white transition-colors"
          />
        </div>
        
        {task?.templateTaskId && (
          <div className="flex items-center gap-3 mt-2 bg-[#1A1A1A] p-3 border border-[#262626]">
            <input
              type="checkbox"
              id="applyGlobally"
              checked={applyGlobally}
              onChange={(e) => setApplyGlobally(e.target.checked)}
              className="w-4 h-4 accent-[#FFFF00] bg-[#262626] border-[#404040] rounded-sm cursor-pointer"
            />
            <div className="flex flex-col">
              <label htmlFor="applyGlobally" className="text-xs font-bold text-white cursor-pointer">
                Apply to all future weeks
              </label>
              <span className="text-[10px] text-gray-500 font-mono">
                Updates this task and all upcoming instances in your schedule
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="ghost" type="button" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button variant="primary" type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
