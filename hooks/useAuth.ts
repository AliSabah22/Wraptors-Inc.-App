/**
 * Convenience hook — returns the Zustand mock-auth store.
 * Existing screens use this directly; swap for Supabase auth when ready.
 */
export { useAuthStore as useAuth } from '@/store/authStore';
