import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  GradientColors,
} from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { MembershipBadge } from '@/components/ui/MembershipBadge';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { MOCK_MEMBERSHIP_PLANS } from '@/data/mockData';
import { MembershipTier } from '@/types';

// ── Feature comparison table ──────────────────────────────────────────────────

interface FeatureRow {
  label: string;
  guest: boolean | string;
  standard: boolean | string;
  gold: boolean | string;
  platinum: boolean | string;
}

const FEATURES: FeatureRow[] = [
  { label: 'Service Tracking', guest: false, standard: true, gold: true, platinum: true },
  { label: 'Service History', guest: false, standard: true, gold: true, platinum: true },
  { label: 'Quote Requests', guest: true, standard: true, gold: true, platinum: true },
  { label: 'Member Pricing', guest: false, standard: true, gold: true, platinum: true },
  { label: 'Priority Booking', guest: false, standard: true, gold: true, platinum: true },
  { label: 'VIP Booking Slots', guest: false, standard: false, gold: true, platinum: true },
  { label: 'Store Discount', guest: false, standard: false, gold: '10% Off', platinum: '20% Off' },
  { label: 'Annual Free Detail', guest: false, standard: false, gold: true, platinum: true },
  { label: 'Referral Rewards', guest: false, standard: false, gold: '$50/referral', platinum: '$100/referral' },
  { label: 'Exclusive Content', guest: false, standard: false, gold: true, platinum: true },
  { label: 'Dedicated Manager', guest: false, standard: false, gold: false, platinum: true },
  { label: 'Concierge Pickup', guest: false, standard: false, gold: false, platinum: true },
  { label: 'Loaner Vehicle', guest: false, standard: false, gold: false, platinum: true },
  { label: 'Lifetime Guarantee', guest: false, standard: false, gold: false, platinum: true },
  { label: 'Private Events', guest: false, standard: false, gold: false, platinum: true },
];

const TIER_COLORS: Record<MembershipTier, string> = {
  guest: Colors.textMuted,
  standard: '#888888',
  gold: Colors.gold,
  platinum: '#E8E8E8',
};

const TIER_GRADIENTS: Record<MembershipTier, readonly [string, string]> = {
  guest: ['#1A1A1A', '#111111'],
  standard: ['#1E1E1E', '#111111'],
  gold: ['#1C1400', '#111111'],
  platinum: ['#1A1A1A', '#111111'],
};

export default function UpgradePage() {
  const router = useRouter();
  const { tier: currentTier } = useMembershipAccess();
  // Default to next tier up, or platinum if already gold
  const defaultSelection: MembershipTier =
    currentTier === 'guest' || currentTier === 'standard' ? 'gold'
    : currentTier === 'gold' ? 'platinum'
    : 'platinum';
  const [selectedPlan, setSelectedPlan] = useState<MembershipTier>(defaultSelection);

  const plans = MOCK_MEMBERSHIP_PLANS;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Membership" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <LinearGradient colors={GradientColors.hero} style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <LinearGradient colors={GradientColors.gold} style={styles.heroIcon}>
              <Ionicons name="shield" size={32} color={Colors.background} />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Upgrade Your Membership</Text>
          <Text style={styles.heroSub}>
            Unlock premium services, exclusive perks, and a dedicated luxury automotive experience.
          </Text>

          {/* Current tier */}
          <View style={styles.currentTierRow}>
            <Text style={styles.currentTierLabel}>Current Plan:</Text>
            <MembershipBadge tier={currentTier} />
          </View>
        </LinearGradient>

        <GoldDivider />

        {/* ── Plan Cards ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansStack}>
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.tier;
              const isCurrent = currentTier === plan.tier;
              const tierColor = TIER_COLORS[plan.tier];

              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.tier)}
                  activeOpacity={0.86}
                >
                  <LinearGradient
                    colors={isSelected ? TIER_GRADIENTS[plan.tier] : ['#111111', '#111111']}
                    style={[
                      styles.planCard,
                      isSelected && { borderColor: tierColor, borderWidth: 1.5 },
                    ]}
                  >
                    {/* Header row */}
                    <View style={styles.planHeader}>
                      <View>
                        <Text style={[styles.planName, { color: tierColor }]}>
                          {plan.name}
                        </Text>
                        <View style={styles.planPriceRow}>
                          <Text style={[styles.planPrice, { color: tierColor }]}>
                            ${plan.price}
                          </Text>
                          <Text style={styles.planPricePer}>/year</Text>
                        </View>
                      </View>
                      <View style={styles.planRight}>
                        {isCurrent && (
                          <View style={[styles.currentBadge, { borderColor: `${tierColor}40`, backgroundColor: `${tierColor}15` }]}>
                            <Text style={[styles.currentBadgeText, { color: tierColor }]}>Current</Text>
                          </View>
                        )}
                        <View style={[
                          styles.selectCircle,
                          isSelected && { backgroundColor: tierColor, borderColor: tierColor },
                        ]}>
                          {isSelected && (
                            <Ionicons name="checkmark" size={14} color={Colors.background} />
                          )}
                        </View>
                      </View>
                    </View>

                    <GoldDivider style={{ marginVertical: Spacing.md }} />

                    {/* Benefits list */}
                    <View style={styles.benefitsList}>
                      {plan.benefits.map((benefit, i) => (
                        <View key={i} style={styles.benefitRow}>
                          <Ionicons name="checkmark-circle" size={14} color={tierColor} />
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaSection}>
          {(() => {
            const plan = plans.find((p) => p.tier === selectedPlan);
            const tierColor = TIER_COLORS[selectedPlan];
            const isCurrent = currentTier === selectedPlan;

            return (
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: tierColor }, isCurrent && styles.ctaBtnDisabled]}
                onPress={() => router.push('/contact/' as any)}
                activeOpacity={isCurrent ? 1 : 0.84}
              >
                <Ionicons
                  name={isCurrent ? 'checkmark-circle' : 'arrow-up-circle'}
                  size={20}
                  color={Colors.background}
                />
                <Text style={styles.ctaBtnText}>
                  {isCurrent
                    ? `You're on ${plan?.name}`
                    : `Upgrade to ${plan?.name} — $${plan?.price}/yr`}
                </Text>
              </TouchableOpacity>
            );
          })()}
          <Text style={styles.ctaNote}>
            Contact our team to upgrade your membership. Cancel anytime.
          </Text>
        </View>

        <GoldDivider />

        {/* ── Feature Comparison ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Comparison</Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderFeature}>Feature</Text>
            <Text style={[styles.tableHeaderTier, { color: TIER_COLORS.standard }]}>Std</Text>
            <Text style={[styles.tableHeaderTier, { color: TIER_COLORS.gold }]}>Gold</Text>
            <Text style={[styles.tableHeaderTier, { color: TIER_COLORS.platinum }]}>Plat</Text>
          </View>

          <View style={styles.tableBody}>
            {FEATURES.map((row, i) => (
              <View
                key={i}
                style={[styles.tableRow, i < FEATURES.length - 1 && styles.tableRowBorder]}
              >
                <Text style={styles.tableFeatureLabel}>{row.label}</Text>
                <FeatureCell value={row.standard} color={TIER_COLORS.standard} />
                <FeatureCell value={row.gold} color={TIER_COLORS.gold} />
                <FeatureCell value={row.platinum} color={TIER_COLORS.platinum} />
              </View>
            ))}
          </View>
        </View>

        {/* ── Trust signals ── */}
        <View style={styles.trustRow}>
          {[
            { icon: 'shield-checkmark-outline' as const, label: 'Secure Payment' },
            { icon: 'refresh-outline' as const, label: 'Cancel Anytime' },
            { icon: 'star-outline' as const, label: 'Instant Perks' },
          ].map((t) => (
            <View key={t.label} style={styles.trustItem}>
              <Ionicons name={t.icon} size={20} color={Colors.gold} />
              <Text style={styles.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCell({ value, color }: { value: boolean | string; color: string }) {
  if (value === false) {
    return (
      <View style={styles.tableCell}>
        <Ionicons name="remove" size={14} color={Colors.textDisabled} />
      </View>
    );
  }
  if (value === true) {
    return (
      <View style={styles.tableCell}>
        <Ionicons name="checkmark" size={14} color={color} />
      </View>
    );
  }
  return (
    <View style={styles.tableCell}>
      <Text style={[styles.tableCellText, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },

  // ── Hero ──
  hero: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroIconWrap: {
    ...Shadow.gold,
    borderRadius: 36,
    marginBottom: Spacing.sm,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    textAlign: 'center',
    letterSpacing: Typography.tight,
  },
  heroSub: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  currentTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentTierLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },

  // ── Plans ──
  section: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  plansStack: {
    gap: Spacing.md,
  },
  planCard: {
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 4,
  },
  planPrice: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.heavy,
    lineHeight: 36,
  },
  planPricePer: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  planRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  selectCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  benefitText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    flex: 1,
    lineHeight: 18,
  },

  // ── CTA ──
  ctaSection: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    width: '100%',
    ...Shadow.gold,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaBtnText: {
    color: Colors.background,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  ctaNote: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
  },

  // ── Feature Table ──
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  tableHeaderFeature: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.wide,
  },
  tableHeaderTier: {
    width: 44,
    textAlign: 'center',
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wide,
  },
  tableBody: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableFeatureLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },
  tableCell: {
    width: 44,
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 9,
    fontWeight: Typography.bold,
    textAlign: 'center',
  },

  // ── Trust ──
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  trustItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trustLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
});
