import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({ percent, showLabel = true, height = 8, animated = true }: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: percent,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(percent);
    }
  }, [percent, animated, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progress</Text>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width: widthInterpolated, height }]}>
          <LinearGradient
            colors={GradientColors.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* Glow dot at progress tip */}
        <Animated.View
          style={[
            styles.glowDot,
            {
              left: widthInterpolated,
              width: height * 1.8,
              height: height * 1.8,
              borderRadius: (height * 1.8) / 2,
              top: -(height * 0.4),
              marginLeft: -(height * 0.9),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  labelText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  percentText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  track: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'visible',
  },
  fill: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  glowDot: {
    position: 'absolute',
    backgroundColor: Colors.goldLight,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
});
