import { StatusChip, cn } from '@pulse/ui';
import { Lock, GripVertical, Trash2 } from 'lucide-react';
import { useTaskStore } from '@/store/tasks';

interface UpcomingPipelineProps {
  tasks: any[];
}

export function UpcomingPipeline({ tasks }: UpcomingPipelineProps) {
  const { deleteTask } = useTaskStore();

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

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
          const isAnchor = task.type === 'Anchor';

          return (
            <div key={task.id} className="flex flex-col">
              {i > 0 && <div className="h-[1px] w-full bg-[#262626]" />}
              <div className={cn(
                "flex items-center gap-4 py-4 group hover:bg-[#1A1A1A] transition-none px-4 -mx-4",
                isCompleted && "opacity-50"
              )}>
                <div className={cn(
                  "w-20 whitespace-nowrap flex-shrink-0 font-mono text-sm",
                  isCompleted ? "text-[#666]" : "text-[#A3A3A3]"
                )}>
                  {formatTime(task.startTime)}
                </div>
                
                <div className={cn(
                  "flex-1 font-medium text-base truncate",
                  isCompleted ? "text-[#888]" : "text-white"
                )}>
                  {task.title}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 uppercase tracking-wider border",
                    isAnchor 
                      ? "text-[#FFFF00] bg-[#FFFF00]/10 border-[#FFFF00]/20" 
                      : "text-[#A3A3A3] bg-[#262626] border-transparent"
                  )}>
                    {task.type}
                  </span>
                  {isAnchor ? (
                    <Lock className="w-4 h-4 text-[#666]" />
                  ) : (
                    <GripVertical className="w-4 h-4 text-[#666]" />
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="ml-2 text-[#666] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
