import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { useCartStore } from '@/store/cartStore';
import { MOCK_PRODUCTS } from '@/data/mockData';
import { formatCurrency } from '@/utils/helpers';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Product" />
        <View style={styles.notFound}><Text style={styles.notFoundText}>Product not found</Text></View>
      </View>
    );
  }

  const handleAddToCart = async () => {
    await addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={product.name}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/store/cart')}>
            <Ionicons name="bag-outline" size={22} color={Colors.gold} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <View style={styles.imageContainer}>
          <Ionicons name="cube-outline" size={72} color={Colors.gold} />
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Badge label="Featured" variant="gold" />
            </View>
          )}
        </View>

        {/* Product info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{product.name}</Text>
            {!product.inStock && <Badge label="Out of Stock" variant="error" />}
          </View>

          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.round(product.rating) ? 'star' : 'star-outline'}
                size={14}
                color={Colors.gold}
              />
            ))}
            <Text style={styles.ratingText}>{product.rating} · {product.reviewCount} reviews</Text>
          </View>

          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        </View>

        <GoldDivider />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {product.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Care note */}
        <View style={styles.careNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.gold} />
          <Text style={styles.careNoteText}>
            All Wraptors products are selected and tested by our technicians for compatibility with wrapped and coated vehicles.
          </Text>
        </View>

        {/* Add to cart */}
        <View style={styles.ctaSection}>
          <Button
            label={added ? '✓ Added to Cart' : `Add to Cart — ${formatCurrency(product.price)}`}
            onPress={handleAddToCart}
            disabled={!product.inStock || added}
            size="lg"
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="View Cart"
            variant="secondary"
            onPress={() => router.push('/store/cart')}
            size="md"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.base, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textMuted, fontSize: Typography.base },
  imageContainer: {
    height: 220,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  infoSection: { gap: Spacing.sm },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginLeft: 2,
  },
  price: {
    color: Colors.gold,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  careNote: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  careNoteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    lineHeight: 18,
  },
  ctaSection: {},
});
