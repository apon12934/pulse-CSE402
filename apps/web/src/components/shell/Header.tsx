'use client'

import { LogOut, Menu, MessageSquare } from 'lucide-react'
import { cn } from '@pulse/ui'
import { useAuthStore } from '@/store/auth'
import { useLayoutStore } from '@/store/layout'
import { useRouter } from 'next/navigation'

import { useState, useRef } from 'react'

export function Header() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="h-14 w-full bg-black border-b border-[#262626] flex items-center justify-between px-4 md:px-6 shrink-0 relative z-[60]">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => useLayoutStore.getState().toggleSidebar()}
          className="lg:hidden text-[#888] hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img src="/logo.svg" alt="Pulse" className="h-8 w-auto ml-1" />
      </div>
      


      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#333] flex items-center justify-center text-xs text-white overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name?.substring(0, 2).toUpperCase() || 'AI'
              )}
            </div>
            <span className="hidden sm:block text-white text-sm font-medium">{user.name}</span>
          </div>
        )}
        <div className="w-px h-6 bg-[#262626] mx-1"></div>
        <button 
          onClick={() => useLayoutStore.getState().toggleChat()}
          className="lg:hidden text-[#888] hover:text-[#FFFF00] transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button 
          onClick={handleLogout}
          className="text-[#888] hover:text-[#FF4444] transition-colors sm:ml-2"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
