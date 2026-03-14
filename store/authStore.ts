/**
 * Auth Store — Zustand
 *
 * FUTURE: Replace mock OTP flow with Supabase Auth phone OTP:
 *   import { supabase } from '@/lib/supabase'
 *   await supabase.auth.signInWithOtp({ phone })
 *   await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { MOCK_USER } from '@/data/mockData';

// Mock OTP code for MVP — replace with real SMS in production
const MOCK_OTP = '123456';
const AUTH_STORAGE_KEY = '@wraptors_auth';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  pendingPhone: string;
  isAuthenticated: boolean;

  // Actions
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isGuest: false,
  isLoading: false,
  pendingPhone: '',
  isAuthenticated: false,

  requestOtp: async (phone: string) => {
    set({ isLoading: true, pendingPhone: phone });
    // FUTURE: await supabase.auth.signInWithOtp({ phone })
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1000));
    set({ isLoading: false });
    console.log(`[MVP] OTP sent to ${phone}. Use code: ${MOCK_OTP}`);
  },

  verifyOtp: async (code: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));

    if (code === MOCK_OTP) {
      const user = { ...MOCK_USER, phone: get().pendingPhone };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, isGuest: false }));
      set({ user, isGuest: false, isAuthenticated: true, isLoading: false });
      return true;
    }

    set({ isLoading: false });
    return false;
  },

  continueAsGuest: () => {
    set({ user: null, isGuest: true, isAuthenticated: false });
  },

  logout: async () => {
    // FUTURE: await supabase.auth.signOut()
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    set({ user: null, isGuest: false, isAuthenticated: false, pendingPhone: '' });
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updated, isGuest: false }));
  },

  loadSession: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const { user, isGuest } = JSON.parse(stored);
        set({ user, isGuest, isAuthenticated: !!user });
      }
    } catch {
      // ignore
    }
  },
}));
