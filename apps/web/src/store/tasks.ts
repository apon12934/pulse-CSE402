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
  deleteTaskGlobally: (taskId: string, templateTaskId: string) => Promise<void>;
  updateTask: (id: string, updates: Record<string, any>, localDate?: Date, applyGlobally?: boolean) => Promise<void>;
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
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const tz = date.getTimezoneOffset();
      const res = await apiGet<{ tasks: any[] }>(`/api/tasks?date=${dateStr}&tz=${tz}`);
      set({ tasks: res.tasks || [], isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  updateTasks: (newTasks: any[]) => {
    set({ tasks: newTasks });
  },

  updateTask: async (id, updates, localDate, applyGlobally) => {
    try {
      const res = await apiPatch<{ task: any }>(`/api/tasks/${id}`, { ...updates, applyGlobally });
      // Optimistically update the local store
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...res.task } : t)
      }));
    } catch (err: any) {
      console.error('Failed to update task:', err);
      set({ error: err.message || 'Failed to update task' });
      // Re-fetch to restore state
      if (localDate) {
        await get().fetchTasks(localDate);
      }
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

  deleteTaskGlobally: async (taskId: string, templateTaskId: string) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));
    try {
      const { apiDelete } = await import('@/lib/api');
      // 1. Delete the template and all future instances natively handled by API
      await apiDelete(`/api/weekly-template/tasks/${templateTaskId}`);
      // 2. Guarantee this specific instance is also wiped (if missed by the future-sweep)
      await apiDelete(`/api/tasks/${taskId}`);
    } catch (err: any) {
      console.error('Failed to delete task globally:', err);
      set({ error: err.message || 'Failed to delete task globally' });
    }
  },

  clearDay: async (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const tz = date.getTimezoneOffset();
    try {
      const { apiFetch } = await import('@/lib/api');
      await apiFetch(`/api/schedule/reset-day?date=${dateStr}&tz=${tz}`, { method: 'DELETE' });
      get().fetchTasks(date);
    } catch (err: any) {
      console.error('Failed to reset day:', err);
      set({ error: err.message || 'Failed to reset day' });
    }
  }
}));
