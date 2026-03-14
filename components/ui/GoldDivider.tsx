import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

interface GoldDividerProps {
  style?: ViewStyle;
  width?: string | number;
}

export function GoldDivider({ style, width = '100%' }: GoldDividerProps) {
  return (
    <View style={[styles.container, style, { width: width as number }]}>
      <LinearGradient
        colors={['transparent', Colors.goldDark, Colors.gold, Colors.goldDark, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 1,
    overflow: 'hidden',
  },
  line: {
    flex: 1,
    height: 1,
  },
});
