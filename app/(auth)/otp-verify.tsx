import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { maskPhone } from '@/utils/helpers';

const CODE_LENGTH = 6;

export default function OTPVerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone ?? '';

  const { verifyOtp, requestOtp, isLoading } = useAuthStore();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // Start resend countdown
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleCodeChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    const arr = digits.split('').concat(Array(CODE_LENGTH).fill('')).slice(0, CODE_LENGTH);
    setCode(arr);
    setError('');

    if (digits.length === CODE_LENGTH) {
      Keyboard.dismiss();
      handleVerify(digits);
    }
  };

  const handleVerify = async (codeStr?: string) => {
    const finalCode = codeStr ?? code.join('');
    if (finalCode.length < CODE_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    const success = await verifyOtp(finalCode);
    if (success) {
      router.replace('/(tabs)/' as any);
    } else {
      setError('Incorrect code. Please try again. (Hint: use 123456)');
      setCode(Array(CODE_LENGTH).fill(''));
      inputRef.current?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await requestOtp(phone);
    setResendTimer(30);
    setCode(Array(CODE_LENGTH).fill(''));
    setError('');
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const codeValue = code.join('');

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing.xl }]}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color={Colors.gold} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.gold} />
        </View>
        <Text style={styles.title}>Verify Your{'\n'}Number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{maskPhone(phone)}</Text>
        </Text>
        <Text style={styles.mvpHint}>MVP: enter code 123456</Text>
      </View>

      {/* Code boxes */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={styles.codeSection}
      >
        <View style={styles.codeBoxRow}>
          {code.map((digit, i) => (
            <View
              key={i}
              style={[
                styles.codeBox,
                digit !== '' && styles.codeBoxFilled,
                i === codeValue.length && styles.codeBoxActive,
                error && styles.codeBoxError,
              ]}
            >
              <Text style={styles.codeDigit}>{digit}</Text>
            </View>
          ))}
        </View>

        {/* Hidden text input to capture keyboard input */}
        <TextInput
          ref={inputRef}
          value={codeValue}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          caretHidden
          autoComplete="one-time-code"
        />
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* Verify button */}
      <View style={styles.ctaSection}>
        <Button
          label="Verify & Continue"
          onPress={() => handleVerify()}
          loading={isLoading}
          disabled={codeValue.length < CODE_LENGTH}
          size="lg"
          style={{ marginBottom: Spacing.lg }}
        />

        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    lineHeight: 24,
  },
  phone: {
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
  mvpHint: {
    color: Colors.gold,
    fontSize: Typography.xs,
    marginTop: Spacing.sm,
    fontWeight: Typography.medium,
  },
  codeSection: {
    marginBottom: Spacing.xl,
  },
  codeBoxRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  codeBox: {
    flex: 1,
    height: 72,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeBoxFilled: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
    backgroundColor: Colors.goldMuted,
  },
  codeBoxActive: {
    borderColor: Colors.gold,
    borderWidth: 2,
    ...Shadow.gold,
  },
  codeBoxError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorMuted,
  },
  codeDigit: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  ctaSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  resendText: {
    color: Colors.gold,
    fontSize: Typography.base,
    textAlign: 'center',
    fontWeight: Typography.medium,
  },
  resendDisabled: {
    color: Colors.textMuted,
  },
});
