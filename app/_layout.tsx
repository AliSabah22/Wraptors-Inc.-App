import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationToast } from '@/components/ui/NotificationToast';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Using system fonts for MVP — add custom fonts here later
  });

  const loadSession = useAuthStore((s) => s.loadSession);
  const loadCart = useCartStore((s) => s.loadCart);
  const loadQuotes = useQuoteStore((s) => s.loadQuotes);
  const { loadNotifications } = useNotificationStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadSession(), loadCart(), loadQuotes()]);
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    init();
  }, [fontsLoaded]);

  useEffect(() => {
    if (user?.id) loadNotifications(user.id);
  }, [user?.id]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="tracking/[id]" />
          <Stack.Screen name="history/index" />
          <Stack.Screen name="history/[id]" />
          <Stack.Screen name="services/[id]" />
          <Stack.Screen name="store/cart" />
          <Stack.Screen name="store/[id]" />
          <Stack.Screen name="quote/index" />
          <Stack.Screen name="emergency/index" />
          <Stack.Screen name="news/index" />
          <Stack.Screen name="news/[id]" />
          <Stack.Screen name="members/index" />
          <Stack.Screen name="contact/index" />
          <Stack.Screen name="staff/index" />
          <Stack.Screen name="notifications/index" />
        </Stack>
        <NotificationToast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
