import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { MOCK_SERVICES } from '@/data/mockData';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  full_wrap: 'color-palette-outline',
  ppf: 'shield-outline',
  ceramic_coating: 'diamond-outline',
  chrome_delete: 'moon-outline',
  tint: 'contrast-outline',
  detailing: 'sparkles-outline',
  custom: 'brush-outline',
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const service = MOCK_SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Service" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Service not found</Text>
        </View>
      </View>
    );
  }

  const icon = CATEGORY_ICONS[service.category] ?? 'car-outline';

  return (
    <View style={styles.container}>
      <ScreenHeader title={service.name} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name={icon} size={52} color={Colors.gold} />
          </View>
          <View style={styles.heroText}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{service.name}</Text>
              {service.popular && <Badge label="Popular" variant="gold" />}
            </View>
            <Text style={styles.heroTagline}>{service.tagline}</Text>
          </View>
        </View>

        <GoldDivider />

        {/* Pricing & duration */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="pricetag" size={20} color={Colors.gold} />
            <Text style={styles.statValue}>{service.priceRange}</Text>
            <Text style={styles.statLabel}>Estimated Price</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="calendar" size={20} color={Colors.gold} />
            <Text style={styles.statValue}>{service.estimatedDays}</Text>
            <Text style={styles.statLabel}>Typical Duration</Text>
          </View>
        </View>

        <GoldDivider />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Service</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          {service.benefits.map((benefit, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitDot}>
                <Ionicons name="checkmark" size={12} color={Colors.background} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Image placeholder */}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={36} color={Colors.textMuted} />
          <Text style={styles.imagePlaceholderText}>Service gallery coming soon</Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaSection}>
          <Button
            label="Request a Free Quote"
            onPress={() => router.push({ pathname: '/quote/' as any, params: { service: service.id } })}
            size="lg"
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="Contact Us"
            variant="secondary"
            onPress={() => router.push('/contact/' as any)}
            size="md"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
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
  hero: {
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexShrink: 0,
  },
  heroText: {
    flex: 1,
    gap: 5,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  heroName: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  heroTagline: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
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
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 22,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  benefitDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: Spacing.sm,
  },
  imagePlaceholderText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    letterSpacing: Typography.wide,
  },
  ctaSection: {
    gap: Spacing.sm,
  },
});
