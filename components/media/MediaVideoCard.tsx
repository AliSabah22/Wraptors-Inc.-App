import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MediaVideo } from '@/types/media';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { PlatformBadge } from './PlatformBadge';
import { formatViews, getThumbColors } from '@/utils/mediaHelpers';
import { timeAgo } from '@/utils/helpers';

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

interface MediaVideoCardProps {
  video: MediaVideo;
}

export function MediaVideoCard({ video }: MediaVideoCardProps) {
  const router = useRouter();
  const [topColor, botColor] = getThumbColors(video.id);
  const categoryIcon = CATEGORY_ICONS[video.category] ?? 'play-circle-outline';

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.82}
      onPress={() => router.push(`/media/${video.id}` as any)}
    >
      {/* Thumbnail */}
      <View style={styles.thumb}>
        <LinearGradient colors={[topColor, botColor]} style={StyleSheet.absoluteFill} />
        <Ionicons
          name={categoryIcon}
          size={26}
          color="rgba(255,255,255,0.14)"
        />
        {/* Play pill — bottom right */}
        <View style={styles.playPill}>
          <Ionicons name="play" size={9} color={Colors.background} />
        </View>
        {/* Duration — bottom left */}
        {video.duration && (
          <View style={styles.durationTag}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <PlatformBadge platform={video.platform} size="sm" />
          {video.vehicleName && (
            <Text style={styles.vehicle} numberOfLines={1}>
              {video.vehicleName}
            </Text>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>

        <View style={styles.bottomRow}>
          <Ionicons name="eye-outline" size={11} color={Colors.textDisabled} />
          <Text style={styles.meta}>{formatViews(video.views)}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.meta}>{timeAgo(video.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.goldBorder,
    minHeight: 100,
  },
  thumb: {
    width: 116,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    flexShrink: 0,
    overflow: 'hidden',
  },
  playPill: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationTag: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: Typography.semibold,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vehicle: {
    flex: 1,
    color: Colors.textDisabled,
    fontSize: Typography.xs,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.textDisabled,
    marginHorizontal: 1,
  },
});
