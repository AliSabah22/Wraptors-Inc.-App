import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/lib/auth/context';

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { supabaseUser, refreshOnboarding } = useSupabaseAuth();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkip = async () => {
    // Mark onboarding complete without phone
    await markComplete();
  };

  const handleSave = async () => {
    if (phone.trim()) {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length < 10) {
        setError('Enter a valid phone number');
        return;
      }
    }
    await markComplete(phone.trim() || undefined);
  };

  const markComplete = async (phoneValue?: string) => {
    if (!supabaseUser) {
      router.replace('/(tabs)/' as any);
      return;
    }
    setIsLoading(true);
    setError(null);

    const updates: Record<string, unknown> = {
      // TODO V2: Add OTP verification once Twilio is connected
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };
    if (phoneValue) updates.phone = phoneValue;

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', supabaseUser.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    await refreshOnboarding();
    router.replace('/(tabs)/' as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator — step 1 of 1 */}
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
        </View>

        {/* Header */}
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>
          Add your phone number to receive job updates and appointment reminders via SMS.
        </Text>

        {/* Greeting if we have the user's name */}
        {supabaseUser?.user_metadata?.full_name ? (
          <View style={styles.greetingCard}>
            <Text style={styles.greetingText}>
              Welcome, <Text style={styles.greetingName}>{supabaseUser.user_metadata.full_name}</Text> 👋
            </Text>
          </View>
        ) : null}

        <Input
          label="Phone number (optional)"
          value={phone}
          onChangeText={(v) => { setPhone(v); setError(null); }}
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="done"
          onSubmitEditing={handleSave}
          leftIcon="phone-portrait-outline"
          error={error ?? undefined}
          placeholder="(416) 555-0100"
          hint="US/CA numbers only · OTP verification coming in V2"
          containerStyle={{ marginTop: Spacing.xl }}
        />

        <View style={styles.btnRow}>
          <Button
            label="Skip"
            onPress={handleSkip}
            variant="ghost"
            loading={isLoading}
            fullWidth={false}
            style={styles.skipBtn}
          />
          <Button
            label="Continue"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            fullWidth={false}
            style={styles.continueBtn}
          />
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
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressBarActive: {
    backgroundColor: Colors.gold,
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
  greetingCard: {
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  greetingText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  greetingName: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  skipBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
  },
});
