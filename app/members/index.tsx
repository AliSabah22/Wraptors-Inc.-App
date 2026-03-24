import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow, GradientColors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { MembershipBadge } from '@/components/ui/MembershipBadge';
import { LockedFeature } from '@/components/ui/LockedFeature';
import { useAuthStore } from '@/store/authStore';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { useReferrals } from '@/hooks/useReferrals';
import { MOCK_MEMBERSHIP_PLANS } from '@/data/mockData';
import { MembershipTier } from '@/types';

// ── Tier colours & gradients ───────────────────────────────────────────────────
const TIER_COLORS: Record<MembershipTier, string> = {
  guest: Colors.textMuted,
  standard: '#888888',
  gold: Colors.gold,
  platinum: '#E8E8E8',
};

// ── Static content data ────────────────────────────────────────────────────────

const VIP_DEALS = [
  {
    id: '1',
    title: '15% Off Ceramic This Month',
    subtitle: 'Gold & Platinum members only',
    icon: 'diamond-outline' as const,
    expires: 'Mar 31',
    tier: 'gold' as MembershipTier,
  },
  {
    id: '2',
    title: 'Free Annual Detail Service',
    subtitle: 'Included with Gold membership',
    icon: 'sparkles-outline' as const,
    expires: 'Ongoing',
    tier: 'gold' as MembershipTier,
  },
  {
    id: '3',
    title: 'VIP Booking Window',
    subtitle: 'Book 2 weeks ahead of standard',
    icon: 'calendar-outline' as const,
    expires: 'Ongoing',
    tier: 'gold' as MembershipTier,
  },
  {
    id: '4',
    title: 'Concierge Pickup & Delivery',
    subtitle: 'Platinum exclusive — we come to you',
    icon: 'car-outline' as const,
    expires: 'Ongoing',
    tier: 'platinum' as MembershipTier,
  },
];

const EXCLUSIVE_CONTENT = [
  {
    id: 'ec1',
    title: 'Rolls-Royce Cullinan Full Wrap',
    label: 'Exclusive Build',
    icon: 'play-circle-outline' as const,
  },
  {
    id: 'ec2',
    title: 'McLaren 720S PPF Installation',
    label: 'Members Only',
    icon: 'film-outline' as const,
  },
  {
    id: 'ec3',
    title: 'Ceramic Coating Masterclass',
    label: 'Education',
    icon: 'school-outline' as const,
  },
];

const VEHICLE_HEALTH_TIPS = [
  { icon: 'water-outline' as const, tip: 'Hand wash only — never automatic car washes' },
  { icon: 'thermometer-outline' as const, tip: 'Avoid direct sunlight exposure for extended periods' },
  { icon: 'calendar-outline' as const, tip: 'Schedule annual inspection to maintain warranty' },
];

const MEMBER_BENEFITS = [
  { icon: 'star-outline' as const, title: 'Priority Booking', desc: 'Skip the queue with member-priority scheduling' },
  { icon: 'gift-outline' as const, title: 'Referral Rewards', desc: 'Earn $50 credit for every member you refer' },
  { icon: 'shield-checkmark-outline' as const, title: 'Extended Warranty', desc: 'Members get extended workmanship guarantee' },
  { icon: 'pricetag-outline' as const, title: 'Member Pricing', desc: 'Exclusive discounts on all services and products' },
  { icon: 'chatbubble-outline' as const, title: 'Dedicated Support', desc: 'Gold+ get a dedicated account manager' },
  { icon: 'notifications-outline' as const, title: 'Early Access', desc: 'First to know about new services and products' },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function MembersScreen() {
  const router = useRouter();
  const { user, isGuest, isAuthenticated } = useAuthStore();
  const { tier, hasAccess } = useMembershipAccess();
  const { referralCount, referralCredits } = useReferrals();

  // ── Guest / unauthenticated gate ──────────────────────────────────────────
  if (isGuest || !isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Members Only" />
        <ScrollView contentContainerStyle={styles.gateContainer} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#1C1400', '#0A0A0A']} style={styles.gateCard}>
            <View style={styles.gateIcon}>
              <Ionicons name="lock-closed" size={40} color={Colors.gold} />
            </View>
            <Text style={styles.gateTitle}>Members Only Area</Text>
            <Text style={styles.gateMessage}>
              Sign in and become a member to unlock exclusive perks, VIP booking, special offers, and more.
            </Text>
            <Button
              label="Sign In Now"
              onPress={() => router.push('/(auth)/phone-login')}
              size="lg"
              style={{ marginTop: Spacing.xl, width: '100%' }}
            />
            <TouchableOpacity
              onPress={() => router.push('/upgrade' as any)}
              style={styles.learnMoreBtn}
            >
              <Text style={styles.learnMoreText}>View membership plans →</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.plansTitle}>Membership Plans</Text>
          {MOCK_MEMBERSHIP_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => router.push('/upgrade' as any)}
              activeOpacity={0.84}
            >
              <View style={[styles.planPreviewCard, { borderColor: `${plan.color}30` }]}>
                <View style={[styles.planTier, { backgroundColor: `${plan.color}20` }]}>
                  <Text style={[styles.planTierName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={[styles.planTierPrice, { color: plan.color }]}>${plan.price}/yr</Text>
                </View>
                <Text style={styles.planBenefit}>{plan.benefits.slice(0, 2).join(' · ')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  const tierColor = TIER_COLORS[tier];
  const currentPlan = MOCK_MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  const nextPlan = MOCK_MEMBERSHIP_PLANS.find((p) =>
    p.tier === (tier === 'standard' ? 'gold' : tier === 'gold' ? 'platinum' : null)
  );

  const handleShare = async () => {
    if (!user?.referralCode) return;
    try {
      await Share.share({
        message: `Join Wraptors Inc. with my referral code ${user.referralCode} and get exclusive member perks on premium automotive protection!`,
      });
    } catch {}
  };

  // ── Authenticated member view ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScreenHeader title="Members Hub" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Membership status hero ── */}
        <LinearGradient colors={['#1C1400', '#111']} style={styles.statusCard}>
          {/* Tier accent strip */}
          <View style={[styles.tierAccentStrip, { backgroundColor: tierColor }]} />

          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.memberName}>{user?.name}</Text>
              <View style={styles.memberBadgeRow}>
                <MembershipBadge tier={tier} />
                {user?.membershipExpiry && (
                  <Text style={styles.expiryText}>
                    Valid through {new Date(user.membershipExpiry).getFullYear()}
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.tierIconWrap, { borderColor: `${tierColor}50`, backgroundColor: `${tierColor}15` }]}>
              <Ionicons name="shield" size={28} color={tierColor} />
            </View>
          </View>

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          <View style={styles.memberStats}>
            <View style={styles.memberStat}>
              <Text style={[styles.memberStatValue, { color: tierColor }]}>{currentPlan?.benefits.length ?? 0}+</Text>
              <Text style={styles.memberStatLabel}>Perks</Text>
            </View>
            <View style={styles.memberStatDivider} />
            <View style={styles.memberStat}>
              <Text style={[styles.memberStatValue, { color: tierColor }]}>$50</Text>
              <Text style={styles.memberStatLabel}>Referral Credit</Text>
            </View>
            <View style={styles.memberStatDivider} />
            <View style={styles.memberStat}>
              <Text style={[styles.memberStatValue, { color: tierColor }]}>
                {user?.membershipExpiry ? new Date(user.membershipExpiry).getFullYear() : 'N/A'}
              </Text>
              <Text style={styles.memberStatLabel}>Valid Through</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Upgrade CTA strip (non-platinum) ── */}
        {tier !== 'platinum' && nextPlan && (
          <TouchableOpacity
            onPress={() => router.push('/upgrade' as any)}
            activeOpacity={0.85}
            style={styles.upgradeBanner}
          >
            <LinearGradient colors={['#1C1400', '#181200']} style={styles.upgradeBannerInner}>
              <View style={styles.upgradeBannerLeft}>
                <Ionicons name="arrow-up-circle-outline" size={20} color={Colors.gold} />
                <View>
                  <Text style={styles.upgradeBannerTitle}>
                    Upgrade to {nextPlan.name}
                  </Text>
                  <Text style={styles.upgradeBannerSub}>
                    Unlock {nextPlan.benefits.length - (currentPlan?.benefits.length ?? 0)} more perks · ${nextPlan.price}/yr
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── VIP Deals ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>VIP Deals</Text>
          </View>
          {VIP_DEALS.map((deal) => {
            const locked = !hasAccess(deal.tier);
            return (
              <TouchableOpacity
                key={deal.id}
                style={[styles.dealCard, locked && styles.dealCardLocked]}
                activeOpacity={locked ? 1 : 0.85}
                onPress={locked ? () => router.push('/upgrade' as any) : undefined}
              >
                <View style={[styles.dealIcon, locked && styles.dealIconLocked]}>
                  <Ionicons
                    name={locked ? 'lock-closed-outline' : deal.icon}
                    size={20}
                    color={locked ? Colors.textDisabled : Colors.gold}
                  />
                </View>
                <View style={styles.dealContent}>
                  <Text style={[styles.dealTitle, locked && styles.dealTitleLocked]}>
                    {deal.title}
                  </Text>
                  <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
                </View>
                <View style={styles.dealExpiry}>
                  {locked ? (
                    <View style={styles.dealLockChip}>
                      <Text style={styles.dealLockChipText}>
                        {deal.tier === 'platinum' ? 'Platinum' : 'Gold'}+
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.dealExpiryText}>{deal.expires}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Exclusive Media Content ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Exclusive Content</Text>
          </View>
          <LockedFeature requiredTier="gold" featureLabel="Exclusive Member Content">
            <View style={styles.contentList}>
              {EXCLUSIVE_CONTENT.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.contentCard}
                  activeOpacity={0.84}
                  onPress={() => router.push('/(tabs)/media' as any)}
                >
                  <View style={styles.contentIconWrap}>
                    <Ionicons name={item.icon} size={22} color={Colors.gold} />
                  </View>
                  <View style={styles.contentInfo}>
                    <View style={styles.contentLabelRow}>
                      <View style={styles.contentLabelChip}>
                        <Text style={styles.contentLabelText}>{item.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
                  </View>
                  <Ionicons name="play-circle" size={24} color={Colors.goldDark} />
                </TouchableOpacity>
              ))}
            </View>
          </LockedFeature>
        </View>

        {/* ── Vehicle Health Tips ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Vehicle Health</Text>
          </View>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons name="car-sport-outline" size={18} color={Colors.gold} />
              <Text style={styles.healthTitle}>Care Reminders</Text>
            </View>
            {VEHICLE_HEALTH_TIPS.map((tip, i) => (
              <View key={i} style={[styles.healthTip, i < VEHICLE_HEALTH_TIPS.length - 1 && styles.healthTipBorder]}>
                <View style={styles.healthTipIcon}>
                  <Ionicons name={tip.icon} size={14} color={Colors.gold} />
                </View>
                <Text style={styles.healthTipText}>{tip.tip}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.healthCta}
              onPress={() => router.push('/emergency/' as any)}
              activeOpacity={0.84}
            >
              <Text style={styles.healthCtaText}>Report an Issue →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Rewards Tracker ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Rewards</Text>
          </View>
          <LockedFeature requiredTier="gold" featureLabel="Referral Rewards Program">
            <View style={styles.rewardsCard}>
              <View style={styles.rewardsHeader}>
                <View style={styles.rewardsStat}>
                  <Text style={styles.rewardsStatValue}>$50</Text>
                  <Text style={styles.rewardsStatLabel}>per referral</Text>
                </View>
                <View style={styles.rewardsDivider} />
                <View style={styles.rewardsStat}>
                  <Text style={styles.rewardsStatValue}>{referralCount}</Text>
                  <Text style={styles.rewardsStatLabel}>referrals made</Text>
                </View>
                <View style={styles.rewardsDivider} />
                <View style={styles.rewardsStat}>
                  <Text style={styles.rewardsStatValue}>${referralCredits.toFixed(0)}</Text>
                  <Text style={styles.rewardsStatLabel}>credits earned</Text>
                </View>
              </View>
              <GoldDivider style={{ marginVertical: Spacing.md }} />
              <Text style={styles.referralDesc}>
                Share your code and earn $50 credit for every new member who joins.
              </Text>
              <View style={styles.referralCodeBox}>
                <Text style={styles.referralCode}>{user?.referralCode}</Text>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.84}>
                  <Ionicons name="share-social-outline" size={14} color={Colors.gold} />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LockedFeature>
        </View>

        {/* ── Member Benefits grid ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Your Benefits</Text>
          </View>
          <View style={styles.benefitsGrid}>
            {MEMBER_BENEFITS.map((b, i) => (
              <View key={i} style={styles.benefitCard}>
                <View style={styles.benefitIconWrap}>
                  <Ionicons name={b.icon} size={20} color={Colors.gold} />
                </View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Platinum upsell (gold only) ── */}
        {tier === 'gold' && (
          <View style={styles.platinumCard}>
            <LinearGradient colors={['#1A1A1A', '#111']} style={styles.platinumCardInner}>
              <View style={styles.platinumIconWrap}>
                <Ionicons name="shield" size={22} color="#E8E8E8" />
              </View>
              <Text style={styles.platinumTitle}>Go Platinum</Text>
              <Text style={styles.platinumDesc}>
                Unlock a dedicated account manager, free annual service, concierge pickup and the ultimate luxury automotive experience.
              </Text>
              <TouchableOpacity
                style={styles.platinumBtn}
                onPress={() => router.push('/upgrade' as any)}
                activeOpacity={0.84}
              >
                <Text style={styles.platinumBtnText}>Explore Platinum — $499/yr</Text>
                <Ionicons name="arrow-forward" size={14} color="#E8E8E8" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Gate (unauthenticated)
  gateContainer: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  gateCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
  },
  gateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  gateTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  gateMessage: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  learnMoreBtn: { marginTop: Spacing.md },
  learnMoreText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  plansTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginTop: Spacing.sm,
  },
  planPreviewCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  planTier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: 2,
  },
  planTierName: { fontSize: Typography.sm, fontWeight: Typography.bold },
  planTierPrice: { fontSize: Typography.sm, fontWeight: Typography.bold },
  planBenefit: { color: Colors.textMuted, fontSize: Typography.xs },

  // Main scroll
  scrollContent: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Status card
  statusCard: {
    margin: Spacing.base,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  tierAccentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  statusLeft: { gap: Spacing.xs },
  welcomeText: { color: Colors.textMuted, fontSize: Typography.sm },
  memberName: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  memberBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  expiryText: { color: Colors.textDisabled, fontSize: Typography.xs },
  tierIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  memberStats: { flexDirection: 'row' },
  memberStat: { flex: 1, alignItems: 'center', gap: 3 },
  memberStatValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  memberStatLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  memberStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },

  // Upgrade banner
  upgradeBanner: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  upgradeBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  upgradeBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  upgradeBannerTitle: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  upgradeBannerSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },

  // VIP Deals
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    gap: Spacing.md,
  },
  dealCardLocked: {
    borderColor: Colors.border,
    borderLeftColor: Colors.border,
    opacity: 0.7,
  },
  dealIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexShrink: 0,
  },
  dealIconLocked: {
    backgroundColor: Colors.backgroundElevated,
    borderColor: Colors.border,
  },
  dealContent: { flex: 1, gap: 3 },
  dealTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  dealTitleLocked: { color: Colors.textMuted },
  dealSubtitle: { color: Colors.textMuted, fontSize: Typography.xs },
  dealExpiry: {},
  dealExpiryText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  dealLockChip: {
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dealLockChipText: {
    color: Colors.textDisabled,
    fontSize: 10,
    fontWeight: Typography.semibold,
  },

  // Exclusive Content
  contentList: { gap: Spacing.sm },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.goldBorder,
    gap: Spacing.md,
  },
  contentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexShrink: 0,
  },
  contentInfo: { flex: 1, gap: 4 },
  contentLabelRow: { flexDirection: 'row' },
  contentLabelChip: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  contentLabelText: {
    color: Colors.gold,
    fontSize: 9,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  contentTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    lineHeight: 18,
  },

  // Vehicle Health
  healthCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  healthTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  healthTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  healthTipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  healthTipIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  healthTipText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  healthCta: { alignSelf: 'flex-start', marginTop: Spacing.xs },
  healthCtaText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },

  // Rewards
  rewardsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: Spacing.sm,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  rewardsStatValue: {
    color: Colors.gold,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  rewardsStatLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: 'center',
  },
  rewardsDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  referralDesc: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  referralCode: {
    color: Colors.gold,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },

  // Benefits grid
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 2,
    borderTopColor: Colors.goldBorder,
    gap: Spacing.xs,
  },
  benefitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginBottom: Spacing.xs,
  },
  benefitTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  benefitDesc: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    lineHeight: 16,
  },

  // Platinum upsell
  platinumCard: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232,232,232,0.25)',
    borderTopWidth: 3,
    borderTopColor: '#E8E8E8',
  },
  platinumCardInner: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  platinumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(232,232,232,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,232,232,0.2)',
  },
  platinumTitle: {
    color: '#E8E8E8',
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  platinumDesc: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  platinumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  platinumBtnText: {
    color: '#E8E8E8',
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
