import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useServiceStore } from '@/store/serviceStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { daysFromNow } from '@/utils/helpers';

export default function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuthStore();
  const { activeJobs, loadJobs } = useServiceStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) loadJobs(user.id);
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await loadJobs(user.id);
    setRefreshing(false);
  }, [user?.id, loadJobs]);

  if (isGuest) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tracking</Text>
        </View>
        <EmptyState
          icon="lock-closed-outline"
          title="Members Only"
          message="Sign in to track your vehicle's service progress in real time."
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)/phone-login')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Service Tracking</Text>
          <Text style={styles.headerSub}>{activeJobs.length} Active Job{activeJobs.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => router.push('/history/')}
        >
          <Ionicons name="time-outline" size={16} color={Colors.gold} />
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>
      <GoldDivider />

      {activeJobs.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title="No Active Services"
          message="You don't have any vehicles currently in service. Request a quote to get started."
          actionLabel="Get a Free Quote"
          onAction={() => router.push('/quote/' as any)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
        >
          {activeJobs.map((job) => {
            const daysLeft = daysFromNow(job.estimatedCompletion);
            const statusBadge = job.status === 'in_progress' ? 'gold' : job.status === 'completed' ? 'success' : 'muted';

            return (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/tracking/${job.id}` as any)}
              >
                <LinearGradient colors={GradientColors.cardGold} style={styles.jobCardInner}>
                  {/* Job header */}
                  <View style={styles.jobHeader}>
                    <View style={styles.jobHeaderLeft}>
                      <Text style={styles.jobVehicle}>
                        {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                      </Text>
                      <Text style={styles.jobService}>{job.serviceType}</Text>
                    </View>
                    <Badge
                      label={job.status.replace('_', ' ')}
                      variant={statusBadge as any}
                    />
                  </View>

                  {/* Progress */}
                  <View style={styles.progressSection}>
                    <ProgressBar percent={job.progressPercent} height={8} />
                  </View>

                  {/* Current stage */}
                  <View style={styles.stageRow}>
                    <View style={styles.stageInfo}>
                      <Ionicons name="construct-outline" size={13} color={Colors.gold} />
                      <Text style={styles.stageName}>{job.currentStageName}</Text>
                    </View>
                    <View style={styles.etaBox}>
                      <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.etaText}>
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                      </Text>
                    </View>
                  </View>

                  {/* Footer */}
                  <View style={styles.jobFooter}>
                    <View style={styles.techRow}>
                      <Ionicons name="person-circle-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.techText}>{job.technicianName}</Text>
                    </View>
                    <View style={styles.viewDetail}>
                      <Text style={styles.viewDetailText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          {/* Completed jobs prompt */}
          <TouchableOpacity
            style={styles.historyPrompt}
            onPress={() => router.push('/history/')}
          >
            <Ionicons name="archive-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.historyPromptText}>View Service History</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  historyBtnText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  jobCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  jobCardInner: {
    padding: Spacing.base,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  jobHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobVehicle: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  jobService: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  stageName: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  etaText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  techText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  viewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  historyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyPromptText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
});
