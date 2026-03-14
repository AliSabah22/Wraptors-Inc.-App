import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { formatPhone } from '@/utils/helpers';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestOtp, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handlePhoneChange = (text: string) => {
    // Only allow digits, max 10
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (error) setError('');
  };

  const handleContinue = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    const formatted = `+1${phone}`;
    await requestOtp(formatted);
    router.push({ pathname: '/(auth)/otp-verify', params: { phone: formatted } });
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
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="phone-portrait-outline" size={32} color={Colors.gold} />
          </View>
          <Text style={styles.title}>Enter Your{'\n'}Phone Number</Text>
          <Text style={styles.subtitle}>
            We'll send you a one-time verification code to confirm your identity.
          </Text>
        </View>

        {/* Phone input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>PHONE NUMBER</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇺🇸 +1</Text>
            </View>
            <View style={[styles.phoneInputWrap, error ? styles.inputError : null]}>
              <Text
                style={[styles.phoneInput, phone.length === 0 && styles.phonePlaceholder]}
              >
                {phone.length === 0 ? '(555) 000-0000' : formatPhone(phone)}
              </Text>
            </View>
          </View>

          {/* Hidden actual input */}
          <View style={styles.hiddenInputWrapper}>
            <View
              style={styles.numberPadTarget}
              // We use a custom number pad approach for cleaner styling
            />
          </View>

          {/* Custom number pad for MVP */}
          <NumberPad value={phone} onChange={handlePhoneChange} />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.hint}>US phone numbers only for MVP. OTP code: 123456</Text>
          )}
        </View>

        {/* Continue */}
        <Button
          label={`Send Code ${phone.length === 10 ? '→' : ''}`}
          onPress={handleContinue}
          loading={isLoading}
          disabled={phone.length < 10}
          size="lg"
        />

        <Text style={styles.terms}>
          By continuing, you agree to receive SMS messages for verification. Standard rates may apply.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function NumberPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  const handlePress = (key: string) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else if (key === '') {
      // noop
    } else {
      onChange(value + key);
    }
  };

  return (
    <View style={numStyles.pad}>
      {keys.map((row, ri) => (
        <View key={ri} style={numStyles.row}>
          {row.map((key, ki) => (
            <TouchableOpacity
              key={ki}
              style={[numStyles.key, key === '' && numStyles.keyDisabled]}
              onPress={() => handlePress(key)}
              activeOpacity={key === '' ? 1 : 0.7}
              disabled={key === ''}
            >
              <Text style={[numStyles.keyText, key === '⌫' && numStyles.backspace]}>
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const numStyles = StyleSheet.create({
  pad: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  key: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyText: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.medium,
  },
  backspace: {
    fontSize: Typography.lg,
    color: Colors.textMuted,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  back: {
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
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
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wider,
    marginBottom: Spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countryCode: {
    height: 56,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCodeText: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  phoneInputWrap: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  inputError: {
    borderColor: Colors.error,
  },
  phoneInput: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.medium,
    letterSpacing: 1,
  },
  phonePlaceholder: {
    color: Colors.textDisabled,
  },
  hiddenInputWrapper: {
    position: 'absolute',
    opacity: 0,
  },
  numberPadTarget: {},
  errorText: {
    color: Colors.error,
    fontSize: Typography.xs,
    marginTop: Spacing.sm,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: Spacing.sm,
  },
  terms: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 16,
  },
});
