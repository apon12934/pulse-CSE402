'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, StatusChip } from '@pulse/ui';
import { PasswordField } from '@/components/ui/PasswordField';
import { apiPost } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('apon@university.edu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const data = await apiPost<{ user: any, token: string }>(endpoint, body);
      login(data.user, data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[28px] font-bold tracking-tight text-white font-sans">PULSE</span>
            <div className="h-3 w-3 rounded-none bg-[#FFFF00]" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888]">
            {isLogin ? 'SYSTEM AUTHENTICATION' : 'NEW SYSTEM IDENTITY'}
          </p>
        </div>

        <Card elevated className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {!isLogin && (
              <Input
                label="FULL NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alamin Islam Apon"
                required
              />
            )}
            
            <Input
              label="EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="apon@university.edu"
              required
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[12px] font-medium leading-4 tracking-[0.05em] uppercase text-[#888]">
                PASSWORD
              </label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="border border-[#FF4444] bg-[#FF4444]/10 p-3">
                <span className="font-mono text-xs text-[#FF4444] uppercase">{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'PROCESSING...' : (isLogin ? 'AUTHENTICATE' : 'INITIALIZE PROFILE')}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-mono text-[11px] text-[#888] hover:text-[#FFFF00] uppercase tracking-widest transition-colors"
          >
            {isLogin ? 'Initialize new identity →' : '← Return to authentication'}
          </button>
        </div>
      </div>
    </div>
  );
}
