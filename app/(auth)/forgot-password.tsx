import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPassword } from '@/lib/auth/helpers';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-outline" size={32} color={Colors.gold} />
        </View>
        <Text style={styles.title}>Reset link sent</Text>
        <Text style={styles.sentBody}>
          Check <Text style={styles.emailHighlight}>{email}</Text> for a password reset link.
        </Text>
        <Button
          label="Back to Sign In"
          onPress={() => router.replace('/(auth)/login' as any)}
          variant="secondary"
          style={{ marginTop: Spacing.xl }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing.xl }]}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.iconWrap}>
          <Ionicons name="key-outline" size={32} color={Colors.gold} />
        </View>
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a reset link.
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={(v) => { setEmail(v); setError(null); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleReset}
          leftIcon="mail-outline"
          error={error ?? undefined}
          placeholder="your@email.com"
          containerStyle={{ marginTop: Spacing.xl }}
        />

        <Button
          label="Send Reset Link"
          onPress={handleReset}
          loading={isLoading}
          disabled={isLoading}
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: { marginBottom: Spacing.xl },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
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
  sentBody: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: Spacing.sm,
  },
  emailHighlight: {
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
});
