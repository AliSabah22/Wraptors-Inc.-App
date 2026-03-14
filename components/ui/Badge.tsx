import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type BadgeVariant = 'gold' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  small?: boolean;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  gold: { bg: Colors.goldMuted, text: Colors.gold, border: Colors.goldBorder },
  success: { bg: Colors.successMuted, text: Colors.success, border: Colors.successBorder },
  warning: { bg: Colors.warningMuted, text: Colors.warning, border: Colors.warningBorder },
  error: { bg: Colors.errorMuted, text: Colors.error, border: Colors.errorBorder },
  info: { bg: Colors.infoMuted, text: Colors.info, border: Colors.infoBorder },
  muted: { bg: Colors.backgroundSubtle, text: Colors.textMuted, border: Colors.border },
};

export function Badge({ label, variant = 'muted', small = false }: BadgeProps) {
  const config = variantConfig[variant];
  return (
    <View
      style={[
        styles.badge,
        small && styles.small,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Text style={[styles.label, small && styles.labelSmall, { color: config.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: 10,
  },
});
