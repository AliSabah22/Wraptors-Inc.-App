import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadow, GradientColors } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  goldBorder?: boolean;
  onPress?: () => void;
  padding?: number;
}

export function Card({ children, style, gradient = false, goldBorder = false, onPress, padding }: CardProps) {
  const content = gradient ? (
    <LinearGradient colors={GradientColors.card} style={[styles.inner, padding !== undefined && { padding }]}>
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.inner, padding !== undefined && { padding }]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.card, goldBorder && styles.goldBorder, Shadow.card, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, goldBorder && styles.goldBorder, Shadow.card, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goldBorder: {
    borderColor: Colors.goldBorder,
  },
  inner: {
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.base,
  },
});
