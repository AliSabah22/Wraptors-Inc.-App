import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MembershipTier } from '@/types';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const TIER_LABELS: Record<MembershipTier, string> = {
  guest: 'Member',
  standard: 'Standard',
  gold: 'Gold',
  platinum: 'Platinum',
};

interface LockedFeatureProps {
  /** Minimum tier required to view this content */
  requiredTier: MembershipTier;
  /** Label describing what is locked, e.g. "Exclusive Content" */
  featureLabel?: string;
  /** Children rendered when user has access */
  children: React.ReactNode;
}

/**
 * Wraps content behind a membership gate.
 * Renders children when the user's tier meets requiredTier.
 * Otherwise shows a premium lock overlay.
 */
export function LockedFeature({ requiredTier, featureLabel, children }: LockedFeatureProps) {
  const { hasAccess } = useMembershipAccess();
  const router = useRouter();

  if (hasAccess(requiredTier)) {
    return <>{children}</>;
  }

  const requiredLabel = TIER_LABELS[requiredTier];

  return (
    <View style={styles.container}>
      {/* Faded preview of children */}
      <View style={styles.preview} pointerEvents="none">
        {children}
      </View>

      {/* Lock overlay */}
      <LinearGradient
        colors={['rgba(10,10,10,0.1)', 'rgba(10,10,10,0.92)', '#0A0A0A']}
        style={styles.overlay}
      >
        <View style={styles.lockIconWrap}>
          <Ionicons name="lock-closed" size={22} color={Colors.gold} />
        </View>
        <Text style={styles.lockTitle}>
          {featureLabel ?? 'Premium Feature'}
        </Text>
        <Text style={styles.lockSub}>
          Requires {requiredLabel} membership or higher
        </Text>
        <TouchableOpacity
          style={styles.unlockBtn}
          onPress={() => router.push('/upgrade' as any)}
          activeOpacity={0.82}
        >
          <Ionicons name="star" size={13} color={Colors.background} />
          <Text style={styles.unlockBtnText}>Unlock with {requiredLabel}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.lg,
  },
  preview: {
    opacity: 0.25,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '25%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  lockIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  lockTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    textAlign: 'center',
  },
  lockSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  unlockBtnText: {
    color: Colors.background,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
});
