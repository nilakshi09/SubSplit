import { create } from 'zustand';
import { api } from '../lib/api';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  group_id: string | null;
  subscription_id: string | null;
  settlement_id: string | null;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<{ notifications: Notification[]; unreadCount: number }>('/api/notifications');
      set({ notifications: data.notifications, unreadCount: data.unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    await api.put(`/api/notifications/${id}/read`);
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.put('/api/notifications/read-all');
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read_at: new Date().toISOString() })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id: string) => {
    await api.delete(`/api/notifications/${id}`);
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
}));
