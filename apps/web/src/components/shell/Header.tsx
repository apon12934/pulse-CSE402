'use client'

import { Bell, Settings, LogOut, Menu, MessageSquare } from 'lucide-react'
import { cn } from '@pulse/ui'
import { useAuthStore } from '@/store/auth'
import { useLayoutStore } from '@/store/layout'
import { useRouter } from 'next/navigation'

import { useState, useRef } from 'react'

export function Header() {
  const { user, token, logout, updateAvatarUrl } = useAuthStore()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await fetch('http://localhost:4000/api/user/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user?.avatarUrl) {
          updateAvatarUrl(data.user.avatarUrl)
        }
      } else {
        const text = await res.text()
        console.error('Failed to upload avatar', res.status, text)
        alert('Upload failed: ' + text)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
        <span className="text-[#FFFF00] font-sans font-bold text-lg tracking-wider">PULSE</span>
      </div>
      


      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-8 h-8 bg-[#333] flex items-center justify-center text-xs text-white overflow-hidden hover:opacity-80 transition-opacity"
            >
              {isUploading ? (
                <span className="animate-pulse">...</span>
              ) : user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name?.substring(0, 2).toUpperCase() || 'AI'
              )}
            </button>
            <span className="hidden sm:block text-white text-sm font-medium">{user.name}</span>
            <span className="px-1.5 py-0.5 border border-[#262626] bg-[#1a1a1a] text-[#888] font-mono text-[10px]">
              {user.tier ? user.tier.toUpperCase() : 'FREE'}
            </span>
          </div>
        )}
        <div className="w-px h-6 bg-[#262626] mx-1"></div>
        <button 
          onClick={() => useLayoutStore.getState().toggleChat()}
          className="lg:hidden text-[#888] hover:text-[#FFFF00] transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button className="hidden sm:block text-[#888] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="hidden sm:block text-[#888] hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
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
