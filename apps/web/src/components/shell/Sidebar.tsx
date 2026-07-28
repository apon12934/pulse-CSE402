'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, Button } from '@pulse/ui';

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Timeline', path: '/timeline' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-[#262626] bg-[#000000]">
      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "block px-4 py-3 text-[12px] font-mono uppercase tracking-wide transition-colors duration-150 rounded-none border-l-2",
                    isActive 
                      ? "border-[#FFFF00] text-[#FFFF00] bg-[#121212]" 
                      : "border-transparent text-[#A3A3A3] hover:bg-[#121212] hover:text-[#FFFF00]"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-[#262626]">
        <Button className="w-full justify-center">
          + ADD ANCHOR
        </Button>
      </div>
    </aside>
  );
}
