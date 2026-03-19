import { useAuthStore } from '@/store/authStore';

/** Returns the currently signed-in user, or null if guest / unauthenticated. */
export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}
