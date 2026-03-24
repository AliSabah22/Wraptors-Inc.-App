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
import { User, Vehicle } from '@/types';
import { MOCK_USER } from '@/data/mockData';
import { signInWithApple, signInWithGoogle, signOut as supabaseSignOut } from '@/lib/auth/helpers';

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
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'apple') => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loadSession: () => Promise<void>;
  /** Hydrate store from a real Supabase profile (called by AuthProvider after session established). */
  hydrateUser: (profile: { id: string; email: string | null; full_name: string | null; phone?: string | null }, vehicles: Vehicle[]) => Promise<void>;
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

  loginWithEmail: async (email: string, _password: string) => {
    set({ isLoading: true });
    // FUTURE: validate credentials against Supabase Auth
    await new Promise((r) => setTimeout(r, 1200));
    const user = { ...MOCK_USER, email };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, isGuest: false }));
    set({ user, isGuest: false, isAuthenticated: true, isLoading: false });
    return true;
  },

  loginWithSocial: async (provider: 'google' | 'apple') => {
    set({ isLoading: true });
    try {
      const { data, error } = provider === 'apple'
        ? await signInWithApple()
        : await signInWithGoogle();

      if (error || !data.user) {
        // User cancelled or Supabase not configured — fall back to mock
        if (!error || (error as any).code === 'ERR_REQUEST_CANCELED') {
          set({ isLoading: false });
          return;
        }
        // Supabase not configured → use mock for development
        const mockUser = { ...MOCK_USER };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser, isGuest: false }));
        set({ user: mockUser, isGuest: false, isAuthenticated: true, isLoading: false });
        return;
      }

      // Real Supabase sign-in — AuthProvider session change handles navigation
      // Store a local user record mapped from Supabase user
      const supaUser = data.user;
      const localUser: typeof MOCK_USER = {
        ...MOCK_USER,
        id: supaUser.id,
        email: supaUser.email ?? '',
        name: supaUser.user_metadata?.full_name ?? supaUser.user_metadata?.name ?? MOCK_USER.name,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: localUser, isGuest: false }));
      set({ user: localUser, isGuest: false, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  continueAsGuest: () => {
    set({ user: null, isGuest: true, isAuthenticated: false });
  },

  logout: async () => {
    await supabaseSignOut();
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

  hydrateUser: async (profile, vehicles) => {
    const current = get().user;
    const hydrated: User = {
      // Preserve mock defaults for fields not yet in Supabase schema
      ...MOCK_USER,
      // Overwrite with real values from Supabase
      id: profile.id,
      email: profile.email ?? current?.email ?? '',
      name: profile.full_name ?? current?.name ?? MOCK_USER.name,
      phone: profile.phone ?? current?.phone ?? '',
      vehicles: vehicles.length > 0 ? vehicles : (current?.vehicles ?? MOCK_USER.vehicles),
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: hydrated, isGuest: false }));
    set({ user: hydrated, isGuest: false, isAuthenticated: true });
  },
}));
