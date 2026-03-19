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
import { signInWithEmail } from '@/lib/auth/helpers';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setIsLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
      // Auth context onAuthStateChange handles redirect
    } catch (err: any) {
      setErrors({
        general: err.message === 'Invalid login credentials'
          ? 'Incorrect email or password'
          : err.message,
      });
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Wraptors account</Text>
        </View>

        {/* Form */}
        <Input
          label="Email"
          value={email}
          onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
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
          onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
          isPassword
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          leftIcon="lock-closed-outline"
          error={errors.password}
          placeholder="Your password"
        />

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password' as any)}
          style={styles.forgotRow}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* General error */}
        {errors.general && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorBoxText}>{errors.general}</Text>
          </View>
        )}

        <Button
          label="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          size="lg"
          style={{ marginTop: Spacing.xs }}
        />

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)}>
            <Text style={styles.registerLink}>Sign up</Text>
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
  header: { marginBottom: Spacing.xxl },
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
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
    paddingVertical: 4,
  },
  forgotText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  registerLink: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
