import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSupabaseAuth } from '@/lib/auth/context';

/**
 * Root entry — redirects based on auth state.
 * Priority: Supabase onboarding → tabs → auth welcome
 */
export default function Index() {
  const { isAuthenticated, isGuest } = useAuthStore();
  const { session, needsOnboarding, isLoading } = useSupabaseAuth();

  // Wait for Supabase to initialize
  if (isLoading) return null;

  // Supabase user who hasn't completed onboarding
  if (session && needsOnboarding) {
    return <Redirect href={'/(onboarding)/profile' as any} />;
  }

  if (isAuthenticated || isGuest || session) {
    return <Redirect href={'/(tabs)/' as any} />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
