import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationItem } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';

const STORAGE_KEY = '@wraptors_notifications';

interface NotificationState {
  notifications: NotificationItem[];
  isLoading: boolean;

  loadNotifications: (userId: string) => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,

  loadNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: NotificationItem[] = JSON.parse(stored);
        set({ notifications: parsed.filter((n) => n.userId === userId), isLoading: false });
      } else {
        // Seed with mock data on first load
        const seeded = MOCK_NOTIFICATIONS.filter((n) => n.userId === userId);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        set({ notifications: seeded, isLoading: false });
      }
    } catch {
      const seeded = MOCK_NOTIFICATIONS.filter((n) => n.userId === userId);
      set({ notifications: seeded, isLoading: false });
    }
  },

  markRead: (id: string) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
