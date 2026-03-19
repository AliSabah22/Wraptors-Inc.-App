import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export default function CheckEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Ionicons name="mail-unread-outline" size={36} color={Colors.gold} />
      </View>

      <Text style={styles.title}>Check your email</Text>

      <Text style={styles.body}>
        We sent a confirmation link to your email address. Click it to activate your account, then sign in.
      </Text>

      <Text style={styles.hint}>
        Didn't get it? Check your spam folder or try registering again.
      </Text>

      <Button
        label="Back to Sign In"
        onPress={() => router.replace('/(auth)/login' as any)}
        variant="secondary"
        style={styles.btn}
      />

      <Button
        label="Try Again"
        onPress={() => router.replace('/(auth)/register' as any)}
        variant="ghost"
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  hint: {
    color: Colors.textDisabled,
    fontSize: Typography.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    maxWidth: 280,
    lineHeight: 20,
  },
  btn: {
    marginTop: Spacing.sm,
  },
});
