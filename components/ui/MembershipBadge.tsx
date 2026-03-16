import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MembershipTier } from '@/types';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface MembershipBadgeProps {
  tier: MembershipTier;
  showLabel?: boolean;
}

const tierConfig: Record<MembershipTier, { label: string; color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
  guest:    { label: 'Guest',       color: Colors.textMuted, bg: 'rgba(255,255,255,0.05)', border: Colors.border,     icon: 'person-outline' },
  standard: { label: 'Standard',    color: '#999999',        bg: 'rgba(136,136,136,0.1)',  border: 'rgba(153,153,153,0.3)', icon: 'shield-outline' },
  gold:     { label: 'Gold Member', color: Colors.gold,      bg: Colors.goldMuted,          border: Colors.goldBorder, icon: 'shield-half-outline' },
  platinum: { label: 'Platinum',    color: '#E8E8E8',        bg: 'rgba(232,232,232,0.1)',  border: 'rgba(232,232,232,0.25)', icon: 'shield' },
};

export function MembershipBadge({ tier, showLabel = true }: MembershipBadgeProps) {
  const config = tierConfig[tier];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={13} color={config.color} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 5,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
});
