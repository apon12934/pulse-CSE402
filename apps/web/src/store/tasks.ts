import { create } from 'zustand';
import { apiGet, apiPatch, apiDelete as _apiDelete } from '@/lib/api';
import { useAuthStore } from './auth';

interface TaskStore {
  tasks: any[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (date: Date) => Promise<void>;
  updateTasks: (newTasks: any[]) => void;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, data: Record<string, any>, date: Date) => Promise<void>;
  clearDay: (date: Date) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async (date: Date) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ tasks: [], error: 'Not authenticated', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await apiGet<{ tasks: any[] }>(`/api/tasks?date=${dateStr}`);
      set({ tasks: res.tasks || [], isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  updateTasks: (newTasks: any[]) => {
    set({ tasks: newTasks });
  },

  updateTask: async (taskId: string, data: Record<string, any>, date: Date) => {
    try {
      const res = await apiPatch<{ task: any }>(`/api/tasks/${taskId}`, data);
      // Optimistically update the local store
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...res.task } : t)
      }));
    } catch (err: any) {
      console.error('Failed to update task:', err);
      set({ error: err.message || 'Failed to update task' });
      // Re-fetch to restore state
      await get().fetchTasks(date);
    }
  },

  deleteTask: async (taskId: string) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));
    try {
      const { apiDelete } = await import('@/lib/api');
      await apiDelete(`/api/tasks/${taskId}`);
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      set({ error: err.message || 'Failed to delete task' });
    }
  },

  clearDay: async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    try {
      const { apiFetch } = await import('@/lib/api');
      await apiFetch(`/api/schedule/reset-day?date=${dateStr}`, { method: 'DELETE' });
      get().fetchTasks(date);
    } catch (err: any) {
      console.error('Failed to reset day:', err);
      set({ error: err.message || 'Failed to reset day' });
    }
  }
}));
