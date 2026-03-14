import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';
import { MediaFilter } from '@/types/media';
import { MOCK_MEDIA } from '@/data/mediaData';
import { FeaturedVideoCard } from '@/components/media/FeaturedVideoCard';
import { MediaVideoCard } from '@/components/media/MediaVideoCard';
import { PlatformFilterPills } from '@/components/media/PlatformFilterPills';
import { MediaEmptyState } from '@/components/media/MediaEmptyState';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';

// FUTURE: Replace with API-backed mediaStore (useMediaStore)

export default function MediaHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasAccess } = useMembershipAccess();
  const hasExclusiveAccess = hasAccess('gold');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const featuredVideo = useMemo(
    () => MOCK_MEDIA.find((v) => v.isFeatured) ?? MOCK_MEDIA[0],
    []
  );

  /** All non-featured videos, optionally filtered by platform */
  const feedVideos = useMemo(() => {
    const pool = MOCK_MEDIA.filter((v) => v.id !== featuredVideo.id);
    if (filter === 'all') return pool;
    return pool.filter((v) => v.platform === filter);
  }, [filter, featuredVideo.id]);

  /** Top 4 by view count for "Trending" row */
  const trendingVideos = useMemo(
    () =>
      [...MOCK_MEDIA]
        .filter((v) => v.id !== featuredVideo.id)
        .sort((a, b) => b.views - a.views)
        .slice(0, 4),
    [featuredVideo.id]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // FUTURE: re-fetch from API
    await new Promise((r) => setTimeout(r, 900));
    setRefreshing(false);
  };

  const feedTitle =
    filter === 'all'
      ? 'Latest Builds'
      : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Videos`;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient
        colors={GradientColors.hero}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>MEDIA HUB</Text>
            <Text style={styles.headerSub}>Builds · Installs · Transformations</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerCountBadge}>
              <Text style={styles.headerCount}>{MOCK_MEDIA.length}</Text>
              <Text style={styles.headerCountLabel}>videos</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="play-circle" size={22} color={Colors.gold} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        {/* ── Featured Video ── */}
        <View style={styles.section}>
          <FeaturedVideoCard video={featuredVideo} />
        </View>

        {/* ── Members exclusive content teaser ── */}
        {!hasExclusiveAccess && (
          <TouchableOpacity
            onPress={() => router.push('/upgrade' as any)}
            activeOpacity={0.85}
            style={styles.exclusiveBanner}
          >
            <LinearGradient colors={['#1C1400', '#181200']} style={styles.exclusiveBannerInner}>
              <View style={styles.exclusiveLockWrap}>
                <Ionicons name="lock-closed" size={14} color={Colors.gold} />
              </View>
              <View style={styles.exclusiveBannerText}>
                <Text style={styles.exclusiveBannerTitle}>Exclusive Member Content</Text>
                <Text style={styles.exclusiveBannerSub}>Gold members unlock 12+ exclusive builds & behind-the-scenes videos</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Trending Builds (horizontal scroll) ── */}
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingScroll}
          >
            {trendingVideos.map((v) => (
              <TrendingCard
                key={v.id}
                video={v}
                onPress={() => router.push(`/media/${v.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Platform Filters ── */}
        <PlatformFilterPills selected={filter} onSelect={setFilter} />

        {/* ── Feed ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>{feedTitle}</Text>
            <Text style={styles.sectionCount}>
              {feedVideos.length} video{feedVideos.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {feedVideos.length === 0 ? (
            <MediaEmptyState platform={filter !== 'all' ? filter : undefined} />
          ) : (
            <View style={styles.feedList}>
              {feedVideos.map((v) => (
                <MediaVideoCard key={v.id} video={v} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Trending Card (compact vertical thumbnail card) ──────────────────────────
import { getThumbColors, formatViews } from '@/utils/mediaHelpers';
import { MediaVideo } from '@/types/media';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  wrap: 'car-sport-outline',
  ppf: 'shield-outline',
  ceramic: 'sparkles-outline',
  tint: 'contrast-outline',
  detailing: 'water-outline',
  reveal: 'eye-outline',
  bts: 'film-outline',
  education: 'information-circle-outline',
};

function TrendingCard({
  video,
  onPress,
}: {
  video: MediaVideo;
  onPress: () => void;
}) {
  const [top, bot] = getThumbColors(video.id);
  const icon = CATEGORY_ICONS[video.category] ?? 'play-circle-outline';

  return (
    <TouchableOpacity style={tStyles.card} onPress={onPress} activeOpacity={0.84}>
      <View style={tStyles.thumb}>
        <LinearGradient colors={[top, bot]} style={StyleSheet.absoluteFill} />
        <Ionicons name={icon} size={28} color="rgba(255,255,255,0.1)" />
        <View style={tStyles.playChip}>
          <Ionicons name="play" size={9} color={Colors.background} />
        </View>
        {video.duration && (
          <View style={tStyles.dur}>
            <Text style={tStyles.durText}>{video.duration}</Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.80)']}
          style={tStyles.overlay}
        />
        <View style={tStyles.viewBadge}>
          <Ionicons name="flame-outline" size={10} color={Colors.gold} />
          <Text style={tStyles.viewText}>{formatViews(video.views)}</Text>
        </View>
      </View>
      <Text style={tStyles.title} numberOfLines={2}>
        {video.title}
      </Text>
    </TouchableOpacity>
  );
}

const tStyles = StyleSheet.create({
  card: {
    width: 155,
    gap: Spacing.sm,
  },
  thumb: {
    height: 125,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  playChip: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dur: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.68)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: Typography.semibold,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 52,
  },
  viewBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewText: {
    color: Colors.gold,
    fontSize: 9,
    fontWeight: Typography.bold,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    lineHeight: 16,
  },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.heavy,
    letterSpacing: Typography.widest,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerCountBadge: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCount: {
    color: Colors.gold,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    lineHeight: 18,
  },
  headerCountLabel: {
    color: Colors.textDisabled,
    fontSize: 9,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
    paddingTop: Spacing.base,
  },
  section: {
    paddingHorizontal: Spacing.base,
  },
  trendingSection: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  sectionCount: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
  },
  trendingScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    flexDirection: 'row',
  },
  feedList: {
    gap: Spacing.sm,
  },
  exclusiveBanner: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  exclusiveBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exclusiveLockWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  exclusiveBannerText: { flex: 1 },
  exclusiveBannerTitle: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  exclusiveBannerSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
    lineHeight: 16,
  },
});
