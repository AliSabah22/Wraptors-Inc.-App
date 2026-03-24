import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Animated shimmer placeholder for loading states. */
export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.bone,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

/** A stack of skeleton rows — convenience for card placeholders. */
export function SkeletonCard({ rows = 3, style }: { rows?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === 0 ? '60%' : i === rows - 1 ? '40%' : '100%'}
          height={i === 0 ? 18 : 14}
          style={{ marginBottom: i < rows - 1 ? 10 : 0 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: Colors.backgroundElevated,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
});
