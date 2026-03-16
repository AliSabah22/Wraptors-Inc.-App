import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { NotificationItem, NotificationType } from '@/types';

const AUTO_DISMISS_MS = 4000;

function toastIcon(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'service_update': return 'construct-outline';
    case 'promotion':      return 'pricetag-outline';
    case 'recommendation': return 'sparkles-outline';
    case 'media':          return 'images-outline';
    case 'quote':          return 'document-text-outline';
    case 'emergency':      return 'warning-outline';
    default:               return 'notifications-outline';
  }
}

function toastAccent(type: NotificationType): string {
  switch (type) {
    case 'service_update': return Colors.gold;
    case 'promotion':      return '#7C6AFF';
    case 'recommendation': return '#FF8C42';
    case 'media':          return '#42C0FF';
    case 'quote':          return '#4CAF88';
    case 'emergency':      return '#FF4444';
    default:               return Colors.gold;
  }
}

export function NotificationToast() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuthStore();
  const { notifications, markRead } = useNotificationStore();

  const [current, setCurrent] = useState<NotificationItem | null>(null);
  const [shown, setShown] = useState<Set<string>>(new Set());
  const slideY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isLoggedIn = !!user && !isGuest;

  // Pick the first unread notification that hasn't been toasted yet — only when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    if (current) return; // already showing one
    const next = notifications.find((n) => !n.read && !shown.has(n.id));
    if (!next) return;

    setShown((prev) => new Set(prev).add(next.id));
    setCurrent(next);
  }, [notifications, current, isLoggedIn]);

  // Animate in whenever `current` changes
  useEffect(() => {
    if (!current) return;

    // Slide in
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 200,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    dismissTimer.current = setTimeout(() => dismiss(), AUTO_DISMISS_MS);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [current]);

  const dismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrent(null);
      slideY.setValue(-120);
      opacity.setValue(0);
    });
  };

  const handlePress = () => {
    if (!current) return;
    markRead(current.id);
    dismiss();
    setTimeout(() => {
      if (current.linkTo) {
        router.push(current.linkTo as any);
      } else {
        router.push('/notifications/' as any);
      }
    }, 280);
  };

  if (!isLoggedIn || !current) return null;

  const accent = toastAccent(current.type);
  const icon = toastIcon(current.type);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + Spacing.sm, transform: [{ translateY: slideY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.toast, { borderLeftColor: accent }]}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>{current.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{current.body}</Text>
        </View>

        <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.base,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  body: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
