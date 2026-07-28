import { Card, StatusChip, cn } from '@pulse/ui';

export function UpcomingPipeline() {
  const schedule = [
    { time: '11:00 — 12:30', title: 'MAT229 Lecture', status: 'completed', type: 'ANCHOR' },
    { time: '13:00 — 14:30', title: 'CSE323 Lab', status: 'running', type: 'ANCHOR' },
    { time: '14:30 — 15:00', title: 'Lunch Break', status: 'upcoming', type: 'FLUID' },
    { time: '15:00 — 16:30', title: 'EEE206 Tutorial', status: 'upcoming', type: 'ANCHOR' },
    { time: '16:30 — 18:00', title: 'Algorithm Practice', status: 'upcoming', type: 'FLUID' },
    { time: '20:00 — 22:00', title: 'Physics Assignment', status: 'upcoming', type: 'FLUID' },
  ] as const;

  return (
    <Card header="UPCOMING PIPELINE" className="w-full h-full">
      <div className="flex flex-col mt-4">
        {schedule.map((task, i) => (
          <div key={i} className="flex flex-col">
            {i > 0 && <div className="h-[1px] w-full bg-[#262626]" />}
            <div className="flex items-center gap-4 py-4 group hover:bg-[#1A1A1A] transition-none px-2 -mx-2">
              <div className="w-32 flex-shrink-0 text-[#A3A3A3] font-mono text-sm">
                {task.time}
              </div>
              <div className="flex-1 text-white font-medium text-base truncate">
                {task.title}
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 uppercase tracking-wider",
                  task.type === 'ANCHOR' ? "text-[#FFFF00] bg-[#FFFF00]/10" : "text-[#A3A3A3] bg-[#262626]"
                )}>
                  {task.type}
                </span>
                <StatusChip status={task.status as any} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
