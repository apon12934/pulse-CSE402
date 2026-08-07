import { create } from 'zustand';

interface LayoutState {
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  toggleSidebar: () => void;
  toggleChat: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setChatOpen: (isOpen: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarOpen: false,
  isChatOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen, isChatOpen: false })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen, isSidebarOpen: false })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
}));
