import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationItem } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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

    // Try Supabase first when configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any)
          .from('app_notifications')
          .select('*')
          .eq('customer_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const notifications: NotificationItem[] = data.map((row: any) => ({
            id: row.id,
            userId: row.customer_id,
            type: row.type,
            title: row.title,
            body: row.body,
            read: row.read,
            createdAt: row.created_at,
            linkTo: row.link_to ?? undefined,
            ctaLabel: row.cta_label ?? undefined,
            metadata: row.metadata ?? undefined,
          }));
          set({ notifications, isLoading: false });
          return;
        }
      } catch {
        // Fall through to mock
      }
    }

    // Fall back to AsyncStorage / mock data
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: NotificationItem[] = JSON.parse(stored);
        set({ notifications: parsed.filter((n) => n.userId === userId), isLoading: false });
      } else {
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
    if (isSupabaseConfigured) {
      (supabase as any).from('app_notifications').update({ read: true }).eq('id', id).then(() => {});
    }
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
