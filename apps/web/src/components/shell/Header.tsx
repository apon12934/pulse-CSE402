'use client'

import { Bell, Settings } from 'lucide-react'
import { cn } from '@pulse/ui'

export function Header() {
  return (
    <header className="h-14 w-full bg-black border-b border-[#262626] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <span className="text-[#FFFF00] font-sans font-bold text-lg tracking-wider">PULSE</span>
      </div>
      
      <div className="flex items-center">
        <div className="flex font-mono text-[11px] font-bold">
          <button className="px-4 py-1.5 border border-[#262626] text-[#888] bg-transparent border-r-0 hover:text-white transition-colors">LOW</button>
          <button className="px-4 py-1.5 border border-[#FFFF00] text-black bg-[#FFFF00]">MED</button>
          <button className="px-4 py-1.5 border border-[#262626] text-[#888] bg-transparent border-l-0 hover:text-white transition-colors">HIGH</button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#333] flex items-center justify-center text-xs text-white">AI</div>
          <span className="text-white text-sm font-medium">Alamin Islam Apon</span>
          <span className="px-1.5 py-0.5 border border-[#262626] bg-[#1a1a1a] text-[#888] font-mono text-[10px]">FREE</span>
        </div>
        <div className="w-px h-6 bg-[#262626] mx-1"></div>
        <button className="text-[#888] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="text-[#888] hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
