import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow, GradientColors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  style,
  labelStyle,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const heights: Record<ButtonSize, number> = { sm: 40, md: 52, lg: 60 };
  const fontSizes: Record<ButtonSize, number> = { sm: Typography.sm, md: Typography.base, lg: Typography.lg };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        {...props}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? GradientColors.goldDisabled : GradientColors.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { height: heights[size] }, !isDisabled && Shadow.gold]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.background} size="small" />
          ) : (
            <Text style={[styles.labelPrimary, { fontSize: fontSizes[size] }, labelStyle]}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {},
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.gold,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: Colors.errorMuted,
      borderWidth: 1,
      borderColor: Colors.error,
    },
  };

  const labelColors: Record<ButtonVariant, string> = {
    primary: Colors.background,
    secondary: Colors.gold,
    ghost: Colors.textSecondary,
    danger: Colors.error,
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        { height: heights[size] },
        variantStyles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColors[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            { fontSize: fontSizes[size], color: labelColors[variant] },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  labelPrimary: {
    color: Colors.background,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.45,
  },
});
