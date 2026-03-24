import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useServiceStore } from '@/store/serviceStore';
import { useNotificationStore } from '@/store/notificationStore';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ActiveServiceCard } from '@/components/home/ActiveServiceCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Badge } from '@/components/ui/Badge';
import { MembershipBadge } from '@/components/ui/MembershipBadge';
import { MOCK_NEWS, MOCK_PRODUCTS } from '@/data/mockData';
import { timeAgo, formatCurrency } from '@/utils/helpers';
import { useOffers } from '@/hooks/useOffers';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: 'track', label: 'Track\nService', icon: 'pulse' as const, route: '/(tabs)/tracking', color: Colors.gold },
  { id: 'quote', label: 'Free\nQuote', icon: 'document-text-outline' as const, route: '/quote/', color: Colors.success },
  { id: 'emergency', label: 'Emergency\nService', icon: 'alert-circle-outline' as const, route: '/emergency/', color: Colors.error },
  { id: 'services', label: 'Our\nServices', icon: 'car-sport-outline' as const, route: '/(tabs)/services', color: Colors.info },
  { id: 'history', label: 'Service\nHistory', icon: 'time-outline' as const, route: '/history/', color: Colors.accentPurple },
  { id: 'members', label: 'Members\nOnly', icon: 'star-outline' as const, route: '/members/', color: Colors.goldLight },
  { id: 'store', label: 'Shop\nStore', icon: 'bag-outline' as const, route: '/(tabs)/store', color: Colors.warning },
  { id: 'contact', label: 'Contact\nUs', icon: 'call-outline' as const, route: '/contact/', color: Colors.accentTeal },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuthStore();
  const { activeJobs, loadJobs } = useServiceStore();
  const { notifications, loadNotifications, unreadCount } = useNotificationStore();
  const { offers, refresh: refreshOffers } = useOffers();
  const isStandardMember = !isGuest && user?.membershipTier === 'standard';

  useEffect(() => {
    if (user?.id) {
      loadJobs(user.id);
      loadNotifications(user.id);
    }
  }, [user?.id]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await Promise.all([loadJobs(user.id), loadNotifications(user.id), refreshOffers()]);
    setRefreshing(false);
  }, [user?.id, loadJobs, loadNotifications]);

  const notifUnread = unreadCount();
  const recommendations = notifications
    .filter((n) => n.type === 'recommendation' && !n.read)
    .slice(0, 3);

  const displayName = isGuest ? 'Guest' : user?.name?.split(' ')[0] ?? 'Member';
  const featuredNews = MOCK_NEWS.filter((n) => n.featured).slice(0, 2);
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.featured).slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
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
        {/* Hero header */}
        <LinearGradient
          colors={GradientColors.hero}
          style={[styles.hero, { paddingTop: insets.top + Spacing.base }]}
        >
          {/* Top row */}
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>
                {isGuest ? 'Welcome,' : `Good day,`}
              </Text>
              <Text style={styles.greetingName}>{displayName}</Text>
              {!isGuest && user && (
                <MembershipBadge tier={user.membershipTier} />
              )}
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => router.push('/notifications/' as any)}
              >
                <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
                {notifUnread > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>
                      {notifUnread > 9 ? '9+' : notifUnread}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.staffBtn}
                onPress={() => router.push('/staff/' as any)}
              >
                <Ionicons name="settings-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Brand tagline */}
          <View style={styles.heroTagline}>
            <GoldDivider style={{ marginBottom: Spacing.sm }} />
            <Text style={styles.brandLine}>
              <Text style={styles.brandAccent}>WRAPTORS </Text>
              <Text style={styles.brandDim}>INC. — PRECISION AUTOMOTIVE PROTECTION</Text>
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Active service cards */}
          {!isGuest && activeJobs.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Active Services"
                actionLabel={activeJobs.length > 1 ? 'View All' : undefined}
                onAction={() => router.push('/(tabs)/tracking')}
              />
              {activeJobs.slice(0, 2).map((job) => (
                <ActiveServiceCard key={job.id} job={job} />
              ))}
            </View>
          )}

          {/* Guest CTA */}
          {isGuest && (
            <TouchableOpacity
              style={styles.guestCta}
              onPress={() => router.push('/(auth)/phone-login')}
            >
              <LinearGradient colors={GradientColors.goldSubtle} style={styles.guestCtaInner}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.gold} />
                <View style={styles.guestCtaText}>
                  <Text style={styles.guestCtaTitle}>Sign in for Full Access</Text>
                  <Text style={styles.guestCtaSubtitle}>Track services, view history & access member perks</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.gold} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Upgrade nudge for standard members */}
          {isStandardMember && (
            <TouchableOpacity
              style={styles.upgradeBanner}
              onPress={() => router.push('/upgrade' as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#1C1400', '#181200']} style={styles.upgradeBannerInner}>
                <Ionicons name="star-outline" size={18} color={Colors.gold} />
                <View style={styles.upgradeBannerText}>
                  <Text style={styles.upgradeBannerTitle}>Upgrade to Gold Membership</Text>
                  <Text style={styles.upgradeBannerSub}>VIP booking · Exclusive content · Annual detail included</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Quick actions grid */}
          <View style={styles.section}>
            <SectionHeader title="Quick Access" />
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.quickIcon, { backgroundColor: `${action.color}18` }]}>
                    <Ionicons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recommended for You */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Recommended for You"
                actionLabel="View All"
                onAction={() => router.push('/notifications/' as any)}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recoScroll}
              >
                {recommendations.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    style={styles.recoCard}
                    activeOpacity={0.82}
                    onPress={() => router.push((notif.linkTo ?? '/notifications/') as any)}
                  >
                    <View style={styles.recoIconWrap}>
                      <Ionicons name="sparkles-outline" size={20} color={Colors.gold} />
                    </View>
                    <Text style={styles.recoTitle} numberOfLines={2}>{notif.title}</Text>
                    <Text style={styles.recoBody} numberOfLines={2}>{notif.body}</Text>
                    {notif.ctaLabel && (
                      <View style={styles.recoCta}>
                        <Text style={styles.recoCtaText}>{notif.ctaLabel} →</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Offers / Featured news */}
          <View style={styles.section}>
            <SectionHeader
              title={offers.length > 0 ? 'Current Offers' : 'Latest News'}
              actionLabel="View All"
              onAction={() => router.push(offers.length > 0 ? '/members/' as any : '/news/')}
            />
            {offers.length > 0
              ? offers.slice(0, 2).map((offer) => (
                  <TouchableOpacity
                    key={offer.id}
                    style={styles.newsCard}
                    activeOpacity={0.8}
                    onPress={() => router.push('/members/' as any)}
                  >
                    <View style={styles.newsCardInner}>
                      <View style={styles.newsThumb}>
                        <Ionicons name="pricetag-outline" size={24} color={Colors.gold} />
                      </View>
                      <View style={styles.newsContent}>
                        {offer.offerCode
                          ? <Badge label={offer.offerCode} variant="gold" small />
                          : <Badge label="Offer" variant="gold" small />
                        }
                        <Text style={styles.newsTitle} numberOfLines={2}>
                          {offer.title}
                        </Text>
                        <Text style={styles.newsTime}>
                          {offer.offerHeadline ?? offer.offerBody ?? offer.offerCta}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              : featuredNews.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.newsCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/news/${article.id}` as any)}
                  >
                    <View style={styles.newsCardInner}>
                      <View style={styles.newsThumb}>
                        <Ionicons name="newspaper-outline" size={24} color={Colors.gold} />
                      </View>
                      <View style={styles.newsContent}>
                        <Badge label={article.category.replace('_', ' ')} variant="gold" small />
                        <Text style={styles.newsTitle} numberOfLines={2}>
                          {article.title}
                        </Text>
                        <Text style={styles.newsTime}>{timeAgo(article.publishedAt)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
            }
          </View>

          {/* Featured products */}
          <View style={styles.section}>
            <SectionHeader
              title="Shop Products"
              actionLabel="View All"
              onAction={() => router.push('/(tabs)/store')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productScroll}
            >
              {featuredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/store/${product.id}` as any)}
                >
                  <View style={styles.productThumb}>
                    <Ionicons name="cube-outline" size={28} color={Colors.gold} />
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Footer tagline */}
          <View style={styles.footer}>
            <GoldDivider />
            <Text style={styles.footerText}>
              WRAPTORS INC. — WHERE PASSION MEETS PRECISION
            </Text>
          </View>
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
  scroll: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    letterSpacing: Typography.wide,
  },
  greetingName: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
    marginBottom: Spacing.xs,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  notifBtn: {
    position: 'relative',
    padding: Spacing.xs,
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: Typography.bold,
  },
  staffBtn: {
    padding: Spacing.xs,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTagline: {
    marginTop: Spacing.sm,
  },
  brandLine: {
    fontSize: 11,
    letterSpacing: Typography.wider,
  },
  brandAccent: {
    color: Colors.gold,
    fontWeight: Typography.bold,
  },
  brandDim: {
    color: Colors.textMuted,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  guestCta: {
    marginBottom: Spacing.xxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  guestCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  guestCtaText: {
    flex: 1,
  },
  guestCtaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: 2,
  },
  guestCtaSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  upgradeBanner: {
    marginBottom: Spacing.xl,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  upgradeBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  upgradeBannerText: { flex: 1 },
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
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickCard: {
    width: (width - Spacing.base * 2 - Spacing.sm * 3) / 4,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  quickLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: Typography.medium,
    lineHeight: 14,
  },
  newsCard: {
    marginBottom: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  newsCardInner: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  newsThumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  newsContent: {
    flex: 1,
    gap: 4,
  },
  newsTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    lineHeight: 18,
  },
  newsTime: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  productScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  productCard: {
    width: 148,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productThumb: {
    width: '100%',
    height: 96,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  productName: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    marginBottom: 4,
    lineHeight: 17,
  },
  productPrice: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  footerText: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    textAlign: 'center',
  },
  recoScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  recoCard: {
    width: 200,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    gap: 6,
  },
  recoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    lineHeight: 17,
  },
  recoBody: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    lineHeight: 16,
  },
  recoCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
    marginTop: 2,
  },
  recoCtaText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: Typography.semibold,
  },
});
