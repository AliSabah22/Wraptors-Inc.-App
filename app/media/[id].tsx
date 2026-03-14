import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Badge } from '@/components/ui/Badge';
import { PlatformBadge } from '@/components/media/PlatformBadge';
import { MediaVideoCard } from '@/components/media/MediaVideoCard';
import { MOCK_MEDIA } from '@/data/mediaData';
import { formatViews, getThumbColors } from '@/utils/mediaHelpers';
import { formatDate } from '@/utils/helpers';

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

const CATEGORY_LABELS: Record<string, string> = {
  wrap: 'Wrap',
  ppf: 'Paint Protection Film',
  ceramic: 'Ceramic Coating',
  tint: 'Window Tint',
  detailing: 'Detailing',
  reveal: 'Reveal',
  bts: 'Behind the Scenes',
  education: 'Education',
};

const PLATFORM_CTA: Record<string, string> = {
  instagram: 'Open on Instagram',
  tiktok: 'Watch on TikTok',
  youtube: 'Watch on YouTube',
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#C13584',
  tiktok: '#EE1D52',
  youtube: '#FF0000',
};

const PLATFORM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  instagram: 'logo-instagram',
  tiktok: 'musical-notes',
  youtube: 'logo-youtube',
};

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const video = MOCK_MEDIA.find((v) => v.id === id);

  if (!video) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Video" />
        <View style={styles.notFound}>
          <Ionicons name="play-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Video not found</Text>
        </View>
      </View>
    );
  }

  const [topColor, botColor] = getThumbColors(video.id);
  const categoryIcon = CATEGORY_ICONS[video.category] ?? 'play-circle-outline';

  /** Related: same category, different video */
  const related = MOCK_MEDIA.filter(
    (v) => v.id !== video.id && v.category === video.category
  ).slice(0, 3);

  const handleOpenPlatform = () => {
    Linking.openURL(video.videoUrl).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Player Area ── */}
        <View style={styles.player}>
          <LinearGradient colors={[topColor, botColor]} style={StyleSheet.absoluteFill} />

          {/* Large faint category icon for texture */}
          <Ionicons
            name={categoryIcon}
            size={140}
            color="rgba(255,255,255,0.04)"
            style={styles.playerBgIcon}
          />

          {/* Duration — top left */}
          {video.duration && (
            <View style={styles.playerDuration}>
              <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
              <Text style={styles.playerDurationText}>{video.duration}</Text>
            </View>
          )}

          {/* Platform badge — top right */}
          <View style={styles.playerPlatform}>
            <PlatformBadge platform={video.platform} size="md" />
          </View>

          {/* Central play button */}
          <TouchableOpacity
            style={styles.playerPlayWrap}
            onPress={handleOpenPlatform}
            activeOpacity={0.82}
          >
            <View style={styles.playerPlayRing}>
              <LinearGradient
                colors={GradientColors.gold}
                style={styles.playerPlayBtn}
              >
                <Ionicons name="play" size={28} color={Colors.background} />
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Tap hint */}
          <View style={styles.playerHint}>
            <Text style={styles.playerHintText}>Tap to watch on platform</Text>
          </View>

          {/* Bottom gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.playerOverlay}
          />
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Category + vehicle row */}
          <View style={styles.metaTopRow}>
            <View style={styles.categoryTag}>
              <Ionicons name={categoryIcon} size={11} color={Colors.gold} />
              <Text style={styles.categoryText}>
                {CATEGORY_LABELS[video.category]}
              </Text>
            </View>
            {video.vehicleName && (
              <Text style={styles.vehicleText} numberOfLines={1}>
                {video.vehicleName}
              </Text>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{video.title}</Text>

          {/* Stats row */}
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={13} color={Colors.gold} />
              <View>
                <Text style={styles.statValue}>{formatViews(video.views)}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="calendar-outline" size={13} color={Colors.gold} />
              <View>
                <Text style={styles.statValue}>{formatDate(video.createdAt)}</Text>
                <Text style={styles.statLabel}>Published</Text>
              </View>
            </View>
            {video.duration && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="time-outline" size={13} color={Colors.gold} />
                  <View>
                    <Text style={styles.statValue}>{video.duration}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <GoldDivider />

          {/* Description */}
          <Text style={styles.description}>{video.description}</Text>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {video.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <GoldDivider />

          {/* Platform CTA */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: PLATFORM_COLORS[video.platform] },
            ]}
            onPress={handleOpenPlatform}
            activeOpacity={0.82}
          >
            <Ionicons
              name={PLATFORM_ICONS[video.platform]}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.ctaBtnText}>{PLATFORM_CTA[video.platform]}</Text>
            <Ionicons name="open-outline" size={15} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          {/* Related Videos */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <View style={styles.relatedAccent} />
                <Text style={styles.relatedTitle}>More Like This</Text>
              </View>
              <View style={styles.relatedList}>
                {related.map((v) => (
                  <MediaVideoCard key={v.id} video={v} />
                ))}
              </View>
            </View>
          )}
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

  // ── Player ──
  player: {
    height: 320,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldBorder,
  },
  playerBgIcon: {
    position: 'absolute',
  },
  playerDuration: {
    position: 'absolute',
    top: Spacing.base,
    left: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  playerDurationText: {
    color: Colors.textPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  playerPlatform: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
  },
  playerPlayWrap: {
    ...Shadow.gold,
    borderRadius: 44,
  },
  playerPlayRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerPlayBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerHint: {
    position: 'absolute',
    bottom: Spacing.lg,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  playerHintText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
  },
  playerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },

  // ── Content ──
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  categoryText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wide,
  },
  vehicleText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontStyle: 'italic',
    flexShrink: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
    lineHeight: 28,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  statLabel: {
    color: Colors.textDisabled,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    flex: 1,
  },
  relatedSection: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  relatedAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  relatedTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  relatedList: {
    gap: Spacing.sm,
  },
});
