'use client';

import { useState } from 'react';
import { cn } from '@pulse/ui';

export function Header() {
  const [energyLevel, setEnergyLevel] = useState<'LOW' | 'MED' | 'HIGH'>('MED');
  const levels = ['LOW', 'MED', 'HIGH'] as const;

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-[#262626] bg-[#000000] px-6">
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-bold tracking-tight text-white font-sans">PULSE</span>
        <div className="h-2 w-2 rounded-none bg-[#FFFF00]" />
      </div>

      <div className="flex items-center">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setEnergyLevel(level)}
            className={cn(
              "px-4 py-1 text-xs font-mono uppercase tracking-wider border border-[#262626] transition-none rounded-none -ml-[1px] first:ml-0",
              energyLevel === level 
                ? "bg-[#FFFF00] text-black border-[#FFFF00] z-10 relative" 
                : "bg-transparent text-[#A3A3A3] hover:text-white hover:bg-[#121212]"
            )}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-white font-sans">Alamin Islam Apon</span>
        <span className="border border-[#262626] px-2 py-0.5 text-xs font-mono text-[#A3A3A3] rounded-none bg-[#121212]">
          Free Tier
        </span>
      </div>
    </header>
  );
}
