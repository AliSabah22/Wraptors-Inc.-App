import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, GradientColors, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';


export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)/' as any);
  };

  const features = [
    { icon: 'car-sport-outline' as const, label: 'Real-Time Service Tracking' },
    { icon: 'shield-checkmark-outline' as const, label: 'Premium Protection Services' },
    { icon: 'star-outline' as const, label: 'Members-Only Perks' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background gradient hero */}
      <LinearGradient
        colors={GradientColors.hero}
        style={StyleSheet.absoluteFill}
      />

      {/* Gold accent top line */}
      <LinearGradient
        colors={['transparent', Colors.gold, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={styles.logoIconWrap}>
          <Ionicons name="car-sport" size={48} color={Colors.gold} />
        </View>
        <Text style={styles.brand}>WRAPTORS</Text>
        <Text style={styles.brandSub}>INC.</Text>
        <Text style={styles.tagline}>Precision. Protection. Prestige.</Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon} size={18} color={Colors.gold} />
            </View>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* CTA area */}
      <View style={[styles.ctaArea, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button
          label="Sign In with Phone"
          onPress={() => router.push('/(auth)/phone-login')}
          variant="primary"
          size="lg"
          style={{ marginBottom: Spacing.md }}
        />

        <TouchableOpacity onPress={handleGuest} style={styles.guestBtn}>
          <Text style={styles.guestText}>Continue as Guest</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topLine: {
    height: 1,
    width: '100%',
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logoIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.gold,
  },
  brand: {
    color: Colors.textPrimary,
    fontSize: Typography.display,
    fontWeight: Typography.heavy,
    letterSpacing: Typography.widest * 1.5,
    textAlign: 'center',
  },
  brandSub: {
    color: Colors.gold,
    fontSize: Typography.xxl,
    fontWeight: Typography.heavy,
    letterSpacing: Typography.widest * 2,
    marginTop: -8,
    textAlign: 'center',
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    letterSpacing: Typography.wider,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  features: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  featureLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  ctaArea: {
    paddingHorizontal: Spacing.xl,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.base,
  },
  guestText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  disclaimer: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
});
