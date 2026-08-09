import { useState } from 'react';
import { StatusChip, cn } from '@pulse/ui';
import { Lock, GripVertical, Trash2, Pencil } from 'lucide-react';
import { useTaskStore } from '@/store/tasks';
import { EditTaskModal } from '@/components/shared/EditTaskModal';

interface UpcomingPipelineProps {
  tasks: any[];
}

export function UpcomingPipeline({ tasks }: UpcomingPipelineProps) {
  const { deleteTask } = useTaskStore();
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const currentDate = new Date();

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[#A3A3A3] font-mono text-[11px] uppercase tracking-[0.3em]">
          UPCOMING PIPELINE
        </h2>
        <div className="h-[1px] flex-1 bg-[#262626]" />
      </div>

      <div className="flex flex-col">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#121212] border border-[#262626]">
            <div className="font-sans text-lg text-white mb-2">Clear Schedule</div>
            <div className="font-mono text-[#666] text-xs uppercase tracking-widest">No upcoming tasks today</div>
          </div>
        )}
        {tasks.map((task, i) => {
          const isCompleted = task.status === 'Completed';
          if (isCompleted) return null;

          return (
            <div key={task.id} className="flex flex-col">
              {i > 0 && <div className="h-[1px] w-full bg-[#262626]" />}
              <div className={cn(
                "flex items-center gap-4 py-4 group hover:bg-[#1A1A1A] transition-none px-4 -mx-4",
              )}>
                {/* Time column — start → end */}
                <div className={cn(
                  "w-44 shrink-0 flex items-center gap-2 font-mono text-[11px]",
                  isCompleted ? "text-[#666]" : "text-[#A3A3A3]"
                )}>
                  <span className="text-white font-semibold tracking-wider">{formatTime(task.startTime)}</span>
                  <span className="text-[#555]">→</span>
                  <span className="text-white font-semibold tracking-wider">{formatTime(task.endTime)}</span>
                </div>
                
                <div className={cn(
                  "flex-1 font-medium text-base truncate",
                  isCompleted ? "text-[#888]" : "text-white"
                )}>
                  {task.title}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-[#666] hover:text-[#FFFF00] transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-[#666] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
