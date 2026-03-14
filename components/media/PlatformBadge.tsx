import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaPlatform } from '@/types/media';
import { Typography, Radius } from '@/constants/theme';

const PLATFORM_CONFIG: Record<
  MediaPlatform,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  instagram: {
    label: 'Instagram',
    color: '#FFFFFF',
    bg: '#C13584',
    icon: 'logo-instagram',
  },
  tiktok: {
    label: 'TikTok',
    color: '#FFFFFF',
    bg: '#010101',
    icon: 'musical-notes',
  },
  youtube: {
    label: 'YouTube',
    color: '#FFFFFF',
    bg: '#FF0000',
    icon: 'logo-youtube',
  },
};

interface PlatformBadgeProps {
  platform: MediaPlatform;
  /** sm: icon only | md: icon + label */
  size?: 'sm' | 'md';
}

export function PlatformBadge({ platform, size = 'sm' }: PlatformBadgeProps) {
  const cfg = PLATFORM_CONFIG[platform];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: cfg.bg },
        isSmall ? styles.sm : styles.md,
      ]}
    >
      <Ionicons name={cfg.icon} size={isSmall ? 10 : 12} color={cfg.color} />
      {!isSmall && (
        <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.xs,
  },
  sm: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 0.2,
  },
});
