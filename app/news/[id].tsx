import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Button } from '@/components/ui/Button';
import { MOCK_NEWS } from '@/data/mockData';
import { formatDate } from '@/utils/helpers';
import { NewsCategory } from '@/types';

const CATEGORY_COLORS: Record<NewsCategory, 'gold' | 'success' | 'info' | 'warning' | 'muted'> = {
  shop_update: 'info',
  delivery: 'gold',
  care_tips: 'success',
  new_service: 'warning',
  promotion: 'gold',
};

export default function NewsArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const article = MOCK_NEWS.find((a) => a.id === id);

  if (!article) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Article" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Article not found</Text>
        </View>
      </View>
    );
  }

  // Render body with basic markdown-like formatting
  const paragraphs = article.body.split('\n\n').filter(Boolean);

  return (
    <View style={styles.container}>
      <ScreenHeader title="" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroImage}>
          <Ionicons name="newspaper" size={48} color={Colors.gold} />
        </View>

        {/* Article header */}
        <View style={styles.articleHeader}>
          <View style={styles.metaRow}>
            <Badge
              label={article.category.replace('_', ' ')}
              variant={CATEGORY_COLORS[article.category]}
            />
            <Text style={styles.readTime}>{article.readTimeMinutes} min read</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={14} color={Colors.gold} />
            </View>
            <View>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
            </View>
          </View>
        </View>

        <GoldDivider />

        {/* Article body */}
        <View style={styles.body}>
          {paragraphs.map((para, i) => {
            const isBold = para.startsWith('**') || para.startsWith('#');
            const cleanedPara = para.replace(/\*\*/g, '').replace(/^#+\s/, '');
            return (
              <Text
                key={i}
                style={[styles.paragraph, isBold && styles.boldParagraph]}
              >
                {cleanedPara}
              </Text>
            );
          })}
        </View>

        <GoldDivider />

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Transform Your Vehicle?</Text>
          <Button
            label="Get a Free Quote"
            onPress={() => router.push('/quote/' as any)}
            size="lg"
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="Browse All Services"
            variant="secondary"
            onPress={() => router.push('/(tabs)/services')}
          />
        </View>

        {/* Related articles */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>More from Wraptors</Text>
          {MOCK_NEWS.filter((a) => a.id !== article.id).slice(0, 2).map((related) => (
            <TouchableOpacity
              key={related.id}
              style={styles.relatedCard}
              onPress={() => router.push(`/news/${related.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.relatedThumb}>
                <Ionicons name="newspaper-outline" size={16} color={Colors.gold} />
              </View>
              <Text style={styles.relatedCardTitle} numberOfLines={2}>{related.title}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxxl },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textMuted, fontSize: Typography.base },
  heroImage: {
    height: 240,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldBorder,
  },
  articleHeader: {
    padding: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readTime: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
    lineHeight: 36,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  authorName: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  date: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  body: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  paragraph: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    lineHeight: 25,
  },
  boldParagraph: {
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
    fontSize: Typography.md,
  },
  ctaSection: {
    padding: Spacing.base,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  ctaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  relatedSection: {
    padding: Spacing.base,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  relatedTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginBottom: Spacing.xs,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relatedThumb: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  relatedCardTitle: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 18,
  },
});
