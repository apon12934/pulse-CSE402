'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Header } from '@/components/shell/Header';
import { AiChatPanel } from '@/components/dashboard/AiChatPanel';
import { usePathname } from 'next/navigation';
import { useLayoutStore } from '@/store/layout';
import { cn } from '@pulse/ui';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/';
  
  const { isSidebarOpen, isChatOpen, setSidebarOpen, setChatOpen } = useLayoutStore();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkSizes = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkSizes();
    window.addEventListener('resize', checkSizes);
    return () => window.removeEventListener('resize', checkSizes);
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Drawers & Backdrop */}
        {mounted && isMobile && (
          <>
            {(isSidebarOpen || isChatOpen) && (
              <div 
                className="fixed top-14 bottom-0 left-0 right-0 bg-black/80 z-40 lg:hidden"
                onClick={() => { setSidebarOpen(false); setChatOpen(false); }}
              />
            )}
            
            <div className={cn(
              "fixed top-14 bottom-0 left-0 z-50 w-[280px] bg-[#000000] border-r border-[#262626] transform transition-transform duration-300 ease-in-out lg:hidden",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <Sidebar />
            </div>

            <div className={cn(
              "fixed top-14 bottom-0 right-0 z-50 w-[320px] bg-[#000000] border-l border-[#262626] transform transition-transform duration-300 ease-in-out lg:hidden",
              isChatOpen ? "translate-x-0" : "translate-x-full"
            )}>
              <AiChatPanel />
            </div>
          </>
        )}

        {/* Main Layout */}
        <div className="flex w-full h-full">
          {(!mounted || !isMobile) && (
            <div className="hidden lg:block w-[280px] shrink-0 border-r border-[#262626]">
              <Sidebar />
            </div>
          )}

          <main className="flex-1 min-w-0 h-full overflow-y-auto bg-black">
            {children}
          </main>

          {isDashboard && (!mounted || !isMobile) && (
            <div className="hidden lg:block w-[360px] shrink-0 border-l border-[#262626]">
              <AiChatPanel />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
