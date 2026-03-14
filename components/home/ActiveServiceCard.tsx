import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceJob } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow, GradientColors } from '@/constants/theme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { daysFromNow } from '@/utils/helpers';

interface ActiveServiceCardProps {
  job: ServiceJob;
}

export function ActiveServiceCard({ job }: ActiveServiceCardProps) {
  const router = useRouter();
  const daysLeft = daysFromNow(job.estimatedCompletion);
  const daysText = daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/tracking/${job.id}`)}
      style={[styles.container, Shadow.gold]}
    >
      <LinearGradient
        colors={GradientColors.cardGold}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.activeDotWrap}>
              <Animated.View style={[styles.activeDotRing, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.activeLabel}>ACTIVE SERVICE</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
        </View>

        {/* Vehicle */}
        <Text style={styles.vehicleName}>
          {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
        </Text>
        <Text style={styles.serviceType}>{job.serviceType}</Text>

        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar percent={job.progressPercent} height={6} />
        </View>

        {/* Stage */}
        <View style={styles.stageRow}>
          <View style={styles.stageInfo}>
            <Ionicons name="construct-outline" size={13} color={Colors.gold} />
            <Text style={styles.stageName}>{job.currentStageName}</Text>
          </View>
          <View style={styles.etaInfo}>
            <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.etaText}>Est. {daysText}</Text>
          </View>
        </View>

        {/* Technician */}
        <View style={styles.footer}>
          <Text style={styles.techLabel}>
            Technician: <Text style={styles.techName}>{job.technicianName}</Text>
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  gradient: {
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDotWrap: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.goldMutedLight,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  activeLabel: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
  },
  vehicleName: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  serviceType: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginBottom: Spacing.base,
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
    flex: 1,
  },
  etaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  techLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  techName: {
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
});
