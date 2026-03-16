import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '@/store/cartStore';
import { MOCK_PRODUCTS } from '@/data/mockData';
import { StoreProduct, ProductCategory } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';

const CATEGORY_FILTERS: { label: string; value: ProductCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Care Kits', value: 'care_kit' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Apparel', value: 'apparel' },
  { label: 'Tools', value: 'tools' },
];

export default function StoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<ProductCategory | 'all'>('all');
  const { totalItems, addItem } = useCartStore();

  const cartCount = totalItems();
  const { tier } = useMembershipAccess();
  const memberDiscount = tier === 'platinum' ? '20%' : tier === 'gold' ? '10%' : null;

  const filtered = activeFilter === 'all'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter((p) => p.category === activeFilter);

  const featured = MOCK_PRODUCTS.filter((p) => p.featured).slice(0, 3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shop</Text>
          <Text style={styles.subtitle}>Premium automotive care products</Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push('/store/cart')}
        >
          <Ionicons name="bag-outline" size={22} color={Colors.textPrimary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <GoldDivider />

      {/* Member discount banner */}
      {memberDiscount ? (
        <LinearGradient colors={['#1C1400', '#181200']} style={styles.discountBanner}>
          <Ionicons name="pricetag-outline" size={15} color={Colors.gold} />
          <Text style={styles.discountText}>
            {memberDiscount} member discount applied to all products
          </Text>
          <View style={styles.discountChip}>
            <Text style={styles.discountChipText}>{memberDiscount} OFF</Text>
          </View>
        </LinearGradient>
      ) : (
        <TouchableOpacity
          onPress={() => router.push('/upgrade' as any)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1C1400', '#181200']} style={styles.discountBanner}>
            <Ionicons name="star-outline" size={15} color={Colors.gold} />
            <Text style={styles.discountText}>
              Gold members get 10% off all products
            </Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.gold} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured section */}
        {activeFilter === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featured.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.featuredCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/store/${product.id}` as any)}
                >
                  <View style={styles.featuredThumb}>
                    <Ionicons name="cube-outline" size={32} color={Colors.gold} />
                  </View>
                  <Text style={styles.featuredName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.featuredPrice}>{formatCurrency(product.price)}</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={async (e) => {
                      e.stopPropagation();
                      await addItem(product);
                    }}
                  >
                    <Ionicons name="add" size={14} color={Colors.background} />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORY_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.value)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products grid */}
        <View style={styles.grid}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => router.push(`/store/${product.id}` as any)}
              onAddToCart={() => addItem(product)}
            />
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function ProductCard({
  product,
  onPress,
  onAddToCart,
}: {
  product: StoreProduct;
  onPress: () => void;
  onAddToCart: () => void;
}) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.productThumb}>
        <Ionicons name="cube-outline" size={28} color={Colors.gold} />
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={11} color={Colors.gold} />
        <Text style={styles.ratingText}>{product.rating} ({product.reviewCount})</Text>
      </View>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
        <TouchableOpacity
          style={[styles.addIconBtn, !product.inStock && styles.addIconBtnDisabled]}
          onPress={(e) => {
            e.stopPropagation();
            if (product.inStock) onAddToCart();
          }}
          disabled={!product.inStock}
        >
          <Ionicons
            name={product.inStock ? 'add' : 'close'}
            size={16}
            color={product.inStock ? Colors.background : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  cartBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: Typography.bold,
  },
  section: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  featuredScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  featuredCard: {
    width: 158,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: 6,
  },
  featuredThumb: {
    height: 96,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredName: {
    color: Colors.textPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    lineHeight: 16,
  },
  featuredPrice: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: Colors.gold,
    borderRadius: Radius.sm,
    paddingVertical: 6,
  },
  addBtnText: {
    color: Colors.background,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  filterScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  filterChipText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  filterChipTextActive: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  productThumb: {
    height: 110,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    overflow: 'hidden',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.semibold,
  },
  productName: {
    color: Colors.textPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  productPrice: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  addIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBtnDisabled: {
    backgroundColor: Colors.backgroundElevated,
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldBorder,
  },
  discountText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  discountChip: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  discountChipText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wide,
  },
});
