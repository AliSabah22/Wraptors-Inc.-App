import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSupabaseAuth } from '@/lib/auth/context';
import { Colors } from '@/constants/theme';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const { session, isLoading } = useSupabaseAuth();

  // Wait for Supabase auth to initialize before deciding
  if (isLoading) return null;

  // Redirect if already signed in (either Supabase session or mock Zustand auth)
  if (isAuthenticated || isGuest || session) {
    return <Redirect href={'/(tabs)/' as any} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="check-email" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="otp-verify" />
    </Stack>
  );
}
