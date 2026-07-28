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
        } catch (error) {
          console.error('Failed to verify token:', error);
          if (isMounted) {
            logout();
            router.push('/login');
          }
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [token, user, pathname, router, hydrate, logout]);

  // Don't show children while loading or if not authenticated on a protected route
  if (isLoading && pathname !== '/login') {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#000000]">
        <div className="font-mono text-xs text-[#FFFF00] uppercase tracking-widest animate-pulse">
          VERIFYING_AUTH_TOKEN...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
