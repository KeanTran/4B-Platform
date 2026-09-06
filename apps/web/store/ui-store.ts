import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface Notification {
  id: string;
  type: 'expense' | 'payment' | 'duty' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: UIState['theme']) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Modals
  modalOpen: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: string, data?: Record<string, unknown> | null) => void;
  closeModal: () => void;

  // Active tab (for dashboard)
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          root.setAttribute('data-theme', theme);
        }
      },

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Modals
      modalOpen: null,
      modalData: null,
      openModal: (modalId, data) =>
        set({ modalOpen: modalId, modalData: data ?? null }),
      closeModal: () => set({ modalOpen: null, modalData: null }),

      // Active tab
      activeTab: 'overview',
      setActiveTab: (activeTab) => set({ activeTab }),

      // Notifications
      notifications: [
        {
          id: '1',
          type: 'system' as const,
          title: 'Chào mừng đến với 4B!',
          message: 'Bạn đã tham gia Phòng 302 thành công.',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substring(7),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: '4b-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        notifications: state.notifications,
      }),
    },
  ),
);
