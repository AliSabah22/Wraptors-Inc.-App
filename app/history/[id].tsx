import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StageTimeline } from '@/components/tracking/StageTimeline';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { MOCK_SERVICE_HISTORY } from '@/data/mockData';
import { formatDate, formatCurrency } from '@/utils/helpers';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const record = MOCK_SERVICE_HISTORY.find((h) => h.id === id);

  if (!record) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Service Record" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Record not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`${record.vehicle.make} ${record.vehicle.model}`}
        subtitle={record.serviceType}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <Ionicons name="car-sport" size={28} color={Colors.gold} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {record.vehicle.year} {record.vehicle.make} {record.vehicle.model}
              </Text>
              <Text style={styles.vehicleDetail}>
                {record.vehicle.color} · {record.vehicle.licensePlate}
              </Text>
            </View>
            <Badge label="Completed" variant="success" />
          </View>

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          <View style={styles.detailGrid}>
            <DetailItem label="Service" value={record.serviceType} />
            <DetailItem label="Completed" value={formatDate(record.completedAt)} />
            <DetailItem label="Technician" value={record.technicianName} />
            <DetailItem label="Total Cost" value={formatCurrency(record.totalCost)} highlight />
          </View>

          {/* Rating */}
          {record.rating && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < record.rating! ? 'star' : 'star-outline'}
                    size={18}
                    color={Colors.gold}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Before / After placeholders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before & After</Text>
          <View style={styles.beforeAfterRow}>
            <View style={styles.beforeAfterCard}>
              <View style={styles.beforeAfterThumb}>
                <Ionicons name="image-outline" size={28} color={Colors.textMuted} />
              </View>
              <Text style={styles.beforeAfterLabel}>Before</Text>
            </View>
            <View style={styles.beforeAfterArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.gold} />
            </View>
            <View style={styles.beforeAfterCard}>
              <View style={[styles.beforeAfterThumb, styles.afterThumb]}>
                <Ionicons name="image" size={28} color={Colors.gold} />
              </View>
              <Text style={styles.beforeAfterLabel}>After</Text>
            </View>
          </View>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendCard}>
          <View style={styles.recommendHeader}>
            <Ionicons name="bulb-outline" size={18} color={Colors.gold} />
            <Text style={styles.recommendTitle}>Next Service Recommendation</Text>
          </View>
          <Text style={styles.recommendText}>{record.nextServiceRecommendation}</Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push('/quote/' as any)}
          >
            <Text style={styles.bookBtnText}>Book Next Service →</Text>
          </TouchableOpacity>
        </View>

        {/* Invoice */}
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.invoiceTitle}>Invoice</Text>
          </View>
          <Text style={styles.invoiceText}>{record.invoicePlaceholder}</Text>
          <TouchableOpacity style={styles.invoiceBtn} onPress={() => router.push('/contact/' as any)}>
            <Ionicons name="mail-outline" size={14} color={Colors.gold} />
            <Text style={styles.invoiceBtnText}>Request Invoice Copy</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Timeline</Text>
          <StageTimeline stages={record.stages} />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={detailStyles.item}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, highlight && detailStyles.highlight]}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  item: {
    width: '50%',
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginBottom: 2,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  highlight: {
    color: Colors.gold,
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
  },
  notFoundText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  vehicleIcon: {
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
  vehicleDetail: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  ratingLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 3,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  beforeAfterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  beforeAfterCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  beforeAfterThumb: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  afterThumb: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
  },
  beforeAfterLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  beforeAfterArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendCard: {
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: Spacing.sm,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recommendTitle: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  recommendText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  bookBtn: {
    alignSelf: 'flex-start',
  },
  bookBtnText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  invoiceCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  invoiceTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  invoiceText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  invoiceBtnText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
});
