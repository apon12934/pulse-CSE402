'use client'

import { LayoutGrid, FileText, BarChart3, Globe, SlidersHorizontal, Settings } from 'lucide-react'
import { cn, Button } from '@pulse/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutStore } from '@/store/layout'

const NAV_ITEMS = [
  { name: 'DASHBOARD', icon: LayoutGrid, path: '/' },
  { name: 'TIMELINE', icon: FileText, path: '/timeline' },
  { name: 'SETTINGS', icon: Settings, path: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { setSidebarOpen } = useLayoutStore()

  return (
    <aside className="flex w-full h-full bg-black border-r border-[#262626] flex-col shrink-0">
      <div className="h-6"></div>

      <nav className="flex-1 flex flex-col mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-mono text-[12px] uppercase tracking-wide transition-colors border-l-4",
                isActive 
                  ? "text-[#FFFF00] border-[#FFFF00] bg-[#FFFF00]/5" 
                  : "text-[#888] border-transparent hover:text-[#FFFF00] hover:bg-[#111]"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

    </aside>
  )
}
