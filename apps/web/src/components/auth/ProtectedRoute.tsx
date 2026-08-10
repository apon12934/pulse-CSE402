'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import { apiGet } from '../../lib/api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isLoading, hydrate, logout } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      if (!token) {
        if (pathname !== '/login') {
          router.push('/login');
        }
        return;
      }

      if (!user) {
        try {
          const data = await apiGet<{ user: any }>('/api/auth/me');
          if (isMounted) {
            hydrate(data.user);
          }
        } catch (error: any) {
          console.error('Failed to verify token:', error);
          if (isMounted) {
            // Only force logout if the token is explicitly rejected (401 Unauthorized)
            // If it's a 500 error or network failure, keep the token so the user stays logged in
            if (error.status === 401) {
              logout();
              router.push('/login');
            }
          }
        }
      }
    }

    verifyAuth();

    const handleUnauthorized = () => {
      logout();
      router.push('/login');
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [token, user, pathname, router, hydrate, logout]);

  // Don't show children while loading or if not authenticated on a protected route
  if (isLoading && pathname !== '/login') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black gap-6">
        <img src="/logo.svg" alt="Pulse Logo" className="h-12 w-auto animate-pulse opacity-80" />
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="font-mono text-[10px] text-[#888] uppercase tracking-[0.2em]">
            Waking server from sleep...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
