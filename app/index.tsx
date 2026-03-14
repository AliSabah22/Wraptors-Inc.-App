import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

/**
 * Root entry — redirects based on auth state.
 * FUTURE: Add onboarding flow check here.
 */
export default function Index() {
  const { isAuthenticated, isGuest } = useAuthStore();

  if (isAuthenticated || isGuest) {
    return <Redirect href={"/(tabs)/" as any} />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
