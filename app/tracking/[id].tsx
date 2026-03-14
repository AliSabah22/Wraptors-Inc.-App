import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useServiceStore } from '@/store/serviceStore';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StageTimeline } from '@/components/tracking/StageTimeline';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { formatDate, daysFromNow, formatCurrency } from '@/utils/helpers';

export default function TrackingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeJobs, loadJobs, getJobById } = useServiceStore();

  useEffect(() => {
    if (user?.id && activeJobs.length === 0) {
      loadJobs(user.id);
    }
  }, [user?.id]);

  const job = getJobById(id ?? '');

  if (!job) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Service Details" />
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Job not found</Text>
        </View>
      </View>
    );
  }

  const daysLeft = daysFromNow(job.estimatedCompletion);
  const daysText = daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`;
  const completedStages = job.stages.filter((s) => s.status === 'completed').length;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`${job.vehicle.make} ${job.vehicle.model}`}
        subtitle={job.serviceType}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/staff/' as any)}
            style={styles.staffIcon}
          >
            <Ionicons name="construct-outline" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero progress card */}
        <LinearGradient colors={GradientColors.cardGold} style={styles.heroCard}>
          {/* Vehicle info */}
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconWrap}>
              <Ionicons name="car-sport" size={28} color={Colors.gold} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
              </Text>
              <Text style={styles.vehicleColor}>{job.vehicle.color} · {job.vehicle.licensePlate}</Text>
            </View>
            <Badge
              label={job.status.replace('_', ' ')}
              variant={job.status === 'in_progress' ? 'gold' : 'success'}
            />
          </View>

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          {/* Progress */}
          <ProgressBar percent={job.progressPercent} height={10} />

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{completedStages}/{job.stages.length}</Text>
              <Text style={styles.statLabel}>Stages Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{daysText}</Text>
              <Text style={styles.statLabel}>Est. Completion</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValueGold}>{job.progressPercent}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Current stage highlight */}
        <View style={styles.currentStageCard}>
          <View style={styles.currentStageHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.currentStageLabel}>CURRENTLY IN PROGRESS</Text>
          </View>
          <Text style={styles.currentStageName}>{job.currentStageName}</Text>
          <Text style={styles.technicianText}>
            Technician: <Text style={styles.technicianName}>{job.technicianName}</Text>
          </Text>
          {job.notes && (
            <View style={styles.jobNoteBox}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.gold} style={{ marginRight: 4 }} />
              <Text style={styles.jobNoteText}>{job.notes}</Text>
            </View>
          )}
        </View>

        {/* Service details */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.detailCard}>
            <DetailRow icon="construct-outline" label="Service Type" value={job.serviceType} />
            <DetailRow icon="calendar-outline" label="Started" value={formatDate(job.startedAt)} />
            <DetailRow icon="time-outline" label="Est. Completion" value={formatDate(job.estimatedCompletion)} />
            {job.totalCost && (
              <DetailRow icon="card-outline" label="Estimated Cost" value={formatCurrency(job.totalCost)} highlight />
            )}
          </View>
        </View>

        {/* Stage timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Service Progress Timeline</Text>
          <StageTimeline stages={job.stages} />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => router.push('/contact/' as any)}
        >
          <Ionicons name="chatbubble-outline" size={16} color={Colors.gold} />
          <Text style={styles.contactBtnText}>Contact Us About This Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, highlight = false }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.iconWrap}>
        <Ionicons name={icon} size={14} color={Colors.textMuted} />
      </View>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, highlight && detailStyles.valueHighlight]}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 24,
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  valueHighlight: {
    color: Colors.gold,
    fontWeight: Typography.bold,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  notFoundText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
  },
  heroCard: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  vehicleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  vehicleColor: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.base,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  statValueGold: {
    color: Colors.gold,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  currentStageCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderLeftWidth: 3,
  },
  currentStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  currentStageLabel: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
  },
  currentStageName: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.xs,
  },
  technicianText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  technicianName: {
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  jobNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  jobNoteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    lineHeight: 17,
  },
  detailSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  detailCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  timelineSection: {
    gap: Spacing.sm,
  },
  staffIcon: {
    padding: 4,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginTop: Spacing.sm,
  },
  contactBtnText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
