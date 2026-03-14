import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MediaVideo } from '@/types/media';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { PlatformBadge } from './PlatformBadge';
import { formatViews, getThumbColors } from '@/utils/mediaHelpers';

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

interface FeaturedVideoCardProps {
  video: MediaVideo;
}

export function FeaturedVideoCard({ video }: FeaturedVideoCardProps) {
  const router = useRouter();
  const [topColor, botColor] = getThumbColors(video.id);
  const categoryIcon = CATEGORY_ICONS[video.category] ?? 'play-circle-outline';

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.88}
      onPress={() => router.push(`/media/${video.id}` as any)}
    >
      {/* Thumbnail */}
      <View style={styles.thumb}>
        <LinearGradient
          colors={[topColor, botColor]}
          style={StyleSheet.absoluteFill}
        />

        {/* Large faint category icon for texture */}
        <Ionicons
          name={categoryIcon}
          size={120}
          color="rgba(255,255,255,0.04)"
          style={styles.bgIcon}
        />

        {/* Duration — top left */}
        {video.duration && (
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={10} color={Colors.textSecondary} />
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}

        {/* Platform badge — top right */}
        <View style={styles.platformPos}>
          <PlatformBadge platform={video.platform} size="md" />
        </View>

        {/* Play button */}
        <View style={styles.playRing}>
          <View style={styles.playBtn}>
            <Ionicons name="play" size={20} color={Colors.background} />
          </View>
        </View>

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.92)']}
          style={styles.overlay}
        />

        {/* Text on overlay */}
        <View style={styles.overlayText}>
          <View style={styles.featuredPill}>
            <View style={styles.featuredDot} />
            <Text style={styles.featuredLabel}>FEATURED BUILD</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="eye-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.metaText}>{formatViews(video.views)} views</Text>
            {video.vehicleName && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {video.vehicleName}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    ...Shadow.gold,
  },
  thumb: {
    height: 290,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgIcon: {
    position: 'absolute',
  },
  durationBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.68)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  durationText: {
    color: Colors.textPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  platformPos: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  playRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.gold,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 190,
  },
  overlayText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    gap: 6,
  },
  featuredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  featuredLabel: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    lineHeight: 26,
    letterSpacing: Typography.tight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    flexShrink: 1,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.textDisabled,
    marginHorizontal: 2,
  },
});
