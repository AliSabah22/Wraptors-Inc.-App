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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUpWithEmail } from '@/lib/auth/helpers';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearError = (key: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Enter your full name';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setIsLoading(true);

    try {
      const data = await signUpWithEmail(
        email.trim().toLowerCase(),
        password,
        fullName.trim(),
      );

      // Email confirmation required → show check-email screen
      if (data.user && !data.session) {
        router.push('/(auth)/check-email' as any);
        return;
      }
      // Auto-confirmed: onAuthStateChange fires → index.tsx handles redirect
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Track your vehicle, view jobs, and redeem exclusive member offers.
          </Text>
        </View>

        <Input
          label="Full name"
          value={fullName}
          onChangeText={(v) => { setFullName(v); clearError('fullName'); }}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          leftIcon="person-outline"
          error={errors.fullName}
          placeholder="John Smith"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={(v) => { setEmail(v); clearError('email'); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          returnKeyType="next"
          leftIcon="mail-outline"
          error={errors.email}
          placeholder="your@email.com"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={(v) => { setPassword(v); clearError('password'); }}
          isPassword
          returnKeyType="next"
          leftIcon="lock-closed-outline"
          error={errors.password}
          placeholder="Min. 8 characters"
        />

        <Input
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
          isPassword
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          leftIcon="lock-closed-outline"
          error={errors.confirmPassword}
          placeholder="Repeat your password"
        />

        {errors.general && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorBoxText}>{errors.general}</Text>
          </View>
        )}

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          size="lg"
          style={{ marginTop: Spacing.xs }}
        />

        {/* Sign in link */}
        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  back: { marginBottom: Spacing.xl },
  header: { marginBottom: Spacing.xl },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorMuted,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorBoxText: {
    color: Colors.error,
    fontSize: Typography.sm,
    flex: 1,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signInText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  signInLink: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
