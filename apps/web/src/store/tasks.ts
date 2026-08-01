import { create } from 'zustand';
import { apiGet } from '@/lib/api';
import { useAuthStore } from './auth';

interface TaskStore {
  tasks: any[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (date: Date) => Promise<void>;
  updateTasks: (newTasks: any[]) => void;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
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

  deleteTask: async (taskId: string) => {
    try {
      const { apiDelete } = await import('@/lib/api');
      await apiDelete(`/api/tasks/${taskId}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId)
      }));
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      set({ error: err.message || 'Failed to delete task' });
    }
  }
}));
