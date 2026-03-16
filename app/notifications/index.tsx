import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { NotificationItem, NotificationType } from '@/types';

type FilterTab = 'all' | 'service' | 'promotions' | 'for_you';

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Service', value: 'service' },
  { label: 'Promotions', value: 'promotions' },
  { label: 'For You', value: 'for_you' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function notifIcon(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'service_update': return 'construct-outline';
    case 'promotion': return 'pricetag-outline';
    case 'news': return 'newspaper-outline';
    case 'emergency': return 'warning-outline';
    case 'recommendation': return 'sparkles-outline';
    case 'quote': return 'document-text-outline';
    case 'media': return 'images-outline';
    default: return 'notifications-outline';
  }
}

function notifAccent(type: NotificationType): string {
  switch (type) {
    case 'service_update': return Colors.gold;
    case 'promotion': return '#7C6AFF';
    case 'recommendation': return '#FF8C42';
    case 'media': return '#42C0FF';
    case 'quote': return '#4CAF88';
    case 'emergency': return '#FF4444';
    default: return Colors.textMuted;
  }
}

function filterNotifications(
  notifications: NotificationItem[],
  tab: FilterTab
): NotificationItem[] {
  switch (tab) {
    case 'service':
      return notifications.filter((n) =>
        n.type === 'service_update' || n.type === 'media' || n.type === 'quote'
      );
    case 'promotions':
      return notifications.filter((n) => n.type === 'promotion');
    case 'for_you':
      return notifications.filter((n) => n.type === 'recommendation');
    default:
      return notifications;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications, isLoading, loadNotifications, markRead, markAllRead, unreadCount } =
    useNotificationStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (user?.id) loadNotifications(user.id);
  }, [user?.id]);

  const filtered = filterNotifications(notifications, activeTab);
  const count = unreadCount();

  const handleNotifPress = (notif: NotificationItem) => {
    markRead(notif.id);
    if (notif.linkTo) {
      router.push(notif.linkTo as any);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle={count > 0 ? `${count} unread` : 'All caught up'}
        rightAction={
          count > 0 ? (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Filter tabs */}
      <View style={styles.tabsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, activeTab === tab.value && styles.tabActive]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Loading notifications…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No notifications here</Text>
          </View>
        ) : (
          filtered.map((notif) => (
            <NotifCard
              key={notif.id}
              notif={notif}
              onPress={() => handleNotifPress(notif)}
            />
          ))
        )}
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

function NotifCard({
  notif,
  onPress,
}: {
  notif: NotificationItem;
  onPress: () => void;
}) {
  const accent = notifAccent(notif.type);
  const icon = notifIcon(notif.type);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accent }, !notif.read && styles.cardUnread]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      {/* Unread dot */}
      {!notif.read && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{notif.title}</Text>
          <Text style={styles.cardTime}>{timeAgo(notif.createdAt)}</Text>
        </View>
        <Text style={styles.cardBody2} numberOfLines={2}>{notif.body}</Text>
        {notif.ctaLabel && (
          <View style={[styles.cta, { borderColor: accent + '55' }]}>
            <Text style={[styles.ctaText, { color: accent }]}>{notif.ctaLabel} →</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markAllBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  markAllText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  tabsRow: {
    height: 52,
    justifyContent: 'center',
  },
  tabsScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.base,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    gap: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: '#141414',
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  cardBody: {
    flex: 1,
    gap: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    lineHeight: 20,
  },
  cardTime: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    flexShrink: 0,
  },
  cardBody2: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 19,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  ctaText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
});
