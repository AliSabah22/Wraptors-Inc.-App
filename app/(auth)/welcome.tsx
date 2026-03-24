import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogoModel } from '@/components/ui/LogoModel';
import { useAuthStore } from '@/store/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { continueAsGuest, loginWithEmail, loginWithSocial, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [loginError, setLoginError] = useState('');

  const anyLoading = isLoading || socialLoading !== null;

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)/' as any);
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    await loginWithSocial(provider);
    setSocialLoading(null);
    router.replace('/(tabs)/' as any);
  };

  const handleEmailSignIn = async () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email address');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;
    setLoginError('');

    try {
      const success = await loginWithEmail(email, password);
      if (success) router.replace('/(tabs)/' as any);
    } catch (err: any) {
      setLoginError(err?.message ?? 'Sign in failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Full-screen dark background gradient */}
      <LinearGradient colors={GradientColors.hero} style={StyleSheet.absoluteFill} />

      {/* Top-edge gold accent line — sits just below the status bar */}
      <View style={{ paddingTop: insets.top }}>
        <LinearGradient
          colors={['transparent', Colors.gold, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topLine}
        />
      </View>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <LogoModel size={200} />
        <Text style={styles.brand}>WRAPTORS</Text>
        <Text style={styles.brandAccent}>INC.</Text>
        <Text style={styles.tagline}>Precision · Protection · Prestige</Text>
      </View>

      {/* ── Bottom form card ─────────────────────────────────────────────── */}
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={[
            styles.cardContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Social buttons */}
          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => handleSocial('apple')}
            disabled={anyLoading}
          >
            <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
            <Text style={styles.socialBtnText}>
              {socialLoading === 'apple' ? 'Signing in…' : 'Continue with Apple'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => handleSocial('google')}
            disabled={anyLoading}
          >
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.socialBtnText}>
              {socialLoading === 'google' ? 'Signing in…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email form */}
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(''); }}
            error={emailError}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
            error={passwordError}
            leftIcon="lock-closed-outline"
            isPassword
          />

          <Button
            label="Sign In"
            onPress={handleEmailSignIn}
            loading={isLoading && socialLoading === null}
            disabled={anyLoading}
            size="lg"
            style={{ marginTop: Spacing.xs }}
          />

          {loginError ? (
            <View style={styles.loginErrorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.loginErrorText}>{loginError}</Text>
            </View>
          ) : null}

          {/* Secondary options */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/phone-login')}
              style={styles.secondaryBtn}
              disabled={anyLoading}
            >
              <Ionicons name="phone-portrait-outline" size={14} color={Colors.gold} />
              <Text style={styles.secondaryText}>Sign in with Phone</Text>
            </TouchableOpacity>

            <View style={styles.dot} />

            <TouchableOpacity
              onPress={handleGuest}
              style={styles.secondaryBtn}
              disabled={anyLoading}
            >
              <Text style={styles.secondaryText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register' as any)}
            style={styles.registerLink}
            disabled={anyLoading}
          >
            <Text style={styles.registerLinkText}>
              New here?{' '}
              <Text style={styles.registerLinkAccent}>Create a free account</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topLine: {
    height: 1,
    width: '100%',
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    // Minimum height keeps the logo visible on very small screens
    minHeight: 260,
  },
  brand: {
    color: Colors.textPrimary,
    fontSize: Typography.display,
    fontWeight: Typography.heavy,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  brandAccent: {
    color: Colors.gold,
    fontSize: Typography.xxl,
    fontWeight: Typography.heavy,
    letterSpacing: 8,
    marginTop: -6,
    textAlign: 'center',
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },

  // Social buttons
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  googleG: {
    color: '#4285F4',
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    lineHeight: 20,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
  },

  // Secondary row
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
  },
  secondaryText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textDisabled,
  },

  registerLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  registerLinkText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  registerLinkAccent: {
    color: Colors.gold,
    fontWeight: Typography.medium,
  },
  loginErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorMuted,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    padding: Spacing.sm,
  },
  loginErrorText: {
    color: Colors.error,
    fontSize: Typography.sm,
    flex: 1,
  },
  disclaimer: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: Spacing.xs,
  },
});
