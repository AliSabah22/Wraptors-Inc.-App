import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { MOCK_NEWS } from '@/data/mockData';
import { timeAgo } from '@/utils/helpers';
import { NewsCategory } from '@/types';

const CATEGORY_COLORS: Record<NewsCategory, 'gold' | 'success' | 'info' | 'warning' | 'muted'> = {
  shop_update: 'info',
  delivery: 'gold',
  care_tips: 'success',
  new_service: 'warning',
  promotion: 'gold',
};

export default function NewsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScreenHeader title="News & Updates" subtitle="Latest from Wraptors Inc." />

      <FlatList
        data={MOCK_NEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.articleCard, index === 0 && styles.featuredCard]}
            activeOpacity={0.85}
            onPress={() => router.push(`/news/${item.id}` as any)}
          >
            {/* Image placeholder */}
            <View style={[styles.thumb, index === 0 && styles.thumbFeatured]}>
              <Ionicons
                name="newspaper"
                size={index === 0 ? 36 : 24}
                color={Colors.gold}
              />
              {item.featured && index === 0 && (
                <View style={styles.featuredLabel}>
                  <Text style={styles.featuredLabelText}>FEATURED</Text>
                </View>
              )}
            </View>

            <View style={styles.articleContent}>
              <View style={styles.articleMeta}>
                <Badge
                  label={item.category.replace('_', ' ')}
                  variant={CATEGORY_COLORS[item.category]}
                  small
                />
                <Text style={styles.readTime}>{item.readTimeMinutes} min read</Text>
              </View>
              <Text style={styles.articleTitle} numberOfLines={index === 0 ? 3 : 2}>
                {item.title}
              </Text>
              <Text style={styles.articleExcerpt} numberOfLines={2}>
                {item.excerpt}
              </Text>
              <View style={styles.articleFooter}>
                <Text style={styles.authorText}>{item.author}</Text>
                <Text style={styles.timeText}>{timeAgo(item.publishedAt)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  articleCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  featuredCard: {
    borderColor: Colors.goldBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  thumb: {
    height: 110,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbFeatured: {
    height: 180,
    backgroundColor: Colors.goldMuted,
  },
  featuredLabel: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  featuredLabelText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: Typography.bold,
    letterSpacing: 1.5,
  },
  articleContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readTime: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
  },
  articleTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
    lineHeight: 23,
  },
  articleExcerpt: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: 2,
  },
  authorText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  timeText: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
  },
});
