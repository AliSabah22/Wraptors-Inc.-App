import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { MOCK_SERVICES } from '@/data/mockData';
import { ServiceItem, ServiceCategory } from '@/types';

const CATEGORY_FILTERS: { label: string; value: ServiceCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Wrap', value: 'full_wrap' },
  { label: 'PPF', value: 'ppf' },
  { label: 'Ceramic', value: 'ceramic_coating' },
  { label: 'Chrome', value: 'chrome_delete' },
  { label: 'Tint', value: 'tint' },
  { label: 'Detail', value: 'detailing' },
  { label: 'Custom', value: 'custom' },
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  full_wrap: 'color-palette-outline',
  ppf: 'shield-outline',
  ceramic_coating: 'diamond-outline',
  chrome_delete: 'moon-outline',
  tint: 'contrast-outline',
  detailing: 'sparkles-outline',
  custom: 'brush-outline',
};

export default function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<ServiceCategory | 'all'>('all');

  const filtered = activeFilter === 'all'
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter((s) => s.category === activeFilter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Our Services</Text>
        <Text style={styles.subtitle}>Premium automotive protection & transformation</Text>
      </View>
      <GoldDivider />

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterRow}
      >
        {CATEGORY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={() => router.push(`/services/${item.id}` as any)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function ServiceCard({ service, onPress }: { service: ServiceItem; onPress: () => void }) {
  const icon = CATEGORY_ICONS[service.category] ?? 'car-outline';
  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.serviceIconWrap}>
        <Ionicons name={icon} size={28} color={Colors.gold} />
      </View>
      <View style={styles.serviceContent}>
        <View style={styles.serviceNameRow}>
          <Text style={styles.serviceName}>{service.name}</Text>
          {service.popular && <Badge label="Popular" variant="gold" small />}
        </View>
        <Text style={styles.serviceTagline}>{service.tagline}</Text>
        <View style={styles.serviceFooter}>
          <View style={styles.serviceStat}>
            <Ionicons name="pricetag-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.serviceStatText}>{service.priceRange}</Text>
          </View>
          <View style={styles.serviceStat}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.serviceStatText}>{service.estimatedDays}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  filterRow: {
    maxHeight: 52,
  },
  filterScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  filterChipText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  filterChipTextActive: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  serviceCard: {
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
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexShrink: 0,
  },
  serviceContent: {
    flex: 1,
    gap: 4,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  serviceName: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    flex: 1,
  },
  serviceTagline: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  serviceFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 2,
  },
  serviceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceStatText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
});
