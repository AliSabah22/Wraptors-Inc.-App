import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { MOCK_SERVICE_HISTORY } from '@/data/mockData';
import { formatDate, formatCurrency, serviceCategoryLabel } from '@/utils/helpers';
import { useServiceHistory } from '@/hooks/useServiceHistory';

export default function ServiceHistoryScreen() {
  const router = useRouter();
  const { isGuest, user } = useAuthStore();
  const { history: liveHistory, isLoading } = useServiceHistory();

  if (isGuest) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Service History" />
        <EmptyState
          icon="lock-closed-outline"
          title="Members Only"
          message="Sign in to view your complete service history."
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)/phone-login')}
        />
      </View>
    );
  }

  // Use real Supabase data when available; fall back to mock until confirmed
  const history = liveHistory.length > 0
    ? liveHistory
    : MOCK_SERVICE_HISTORY.filter((h) => h.userId === user?.id);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Service History" subtitle={isLoading ? 'Loading…' : `${history.length} completed services`} />
      {isLoading && <ActivityIndicator size="small" color={Colors.gold} style={styles.loader} />}

      {history.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No History Yet"
          message="Your completed services will appear here."
          actionLabel="Book a Service"
          onAction={() => router.push('/quote/' as any)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {history.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.historyCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/history/${record.id}` as any)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.thumb}>
                  <Ionicons name="car-sport" size={24} color={Colors.gold} />
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.vehicleName}>
                    {record.vehicle.year} {record.vehicle.make} {record.vehicle.model}
                  </Text>
                  <Badge
                    label={record.finalStatus === 'completed' ? 'Done' : 'Cancelled'}
                    variant={record.finalStatus === 'completed' ? 'success' : 'error'}
                    small
                  />
                </View>
                <Text style={styles.serviceType}>{record.serviceType}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.date}>{formatDate(record.completedAt)}</Text>
                  <Text style={styles.cost}>{formatCurrency(record.totalCost)}</Text>
                </View>
                {record.rating && (
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < record.rating! ? 'star' : 'star-outline'}
                        size={12}
                        color={Colors.gold}
                      />
                    ))}
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    marginTop: Spacing.sm,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.goldBorder,
    gap: Spacing.md,
    ...Shadow.subtle,
  },
  cardLeft: {},
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleName: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    flex: 1,
    marginRight: Spacing.xs,
  },
  serviceType: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  date: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  cost: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 3,
  },
});
