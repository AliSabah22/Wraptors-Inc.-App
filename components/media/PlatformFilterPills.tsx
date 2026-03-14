import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaFilter } from '@/types/media';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const FILTERS: {
  value: MediaFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'all', label: 'All', icon: 'grid-outline' },
  { value: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'musical-notes-outline' },
  { value: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
];

interface PlatformFilterPillsProps {
  selected: MediaFilter;
  onSelect: (filter: MediaFilter) => void;
}

export function PlatformFilterPills({ selected, onSelect }: PlatformFilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const active = selected === f.value;
        return (
          <TouchableOpacity
            key={f.value}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onSelect(f.value)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={f.icon}
              size={13}
              color={active ? Colors.gold : Colors.textMuted}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.goldBorder,
    borderWidth: 1.5,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  labelActive: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
});
