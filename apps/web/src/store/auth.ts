import { create } from 'zustand';
import { setToken as setApiToken, getToken as getApiToken } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  tier: string;
  geminiApiKey?: string | null;
  rescheduleStrategy?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? getApiToken() : null,
  isLoading: true, // Initially true while we verify token
  login: (user, token) => {
    setApiToken(token);
    set({ user, token, isLoading: false });
  },
  logout: () => {
    setApiToken(null);
    set({ user: null, token: null, isLoading: false });
  },
  hydrate: (user) => {
    set({ user, isLoading: false });
  },
}));
