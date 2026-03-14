import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/utils/helpers';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCartStore();
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      `Your order total is ${formatCurrency(totalPrice())}. In production, this connects to Stripe checkout.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            await clearCart();
            setOrderSuccess(true);
          },
        },
      ]
    );
  };

  if (orderSuccess) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Order Confirmed" showBack={false} />
        <View style={styles.successState}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successMessage}>
            Thank you for your order. You'll receive a confirmation email shortly.
            {'\n\n'}
            In production, this triggers a real payment + order flow via Stripe.
          </Text>
          <Button
            label="Continue Shopping"
            onPress={() => {
              setOrderSuccess(false);
              router.replace('/(tabs)/store');
            }}
            style={{ marginTop: Spacing.xl }}
            fullWidth={false}
          />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Cart" />
        <EmptyState
          icon="bag-outline"
          title="Your cart is empty"
          message="Browse our store and add some premium products."
          actionLabel="Browse Store"
          onAction={() => router.replace('/(tabs)/store')}
        />
      </View>
    );
  }

  const subtotal = totalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <View style={styles.container}>
      <ScreenHeader title={`Cart (${totalItems()})`} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Items */}
        {items.map((item) => (
          <View key={item.productId} style={styles.cartItem}>
            <View style={styles.itemThumb}>
              <Ionicons name="cube-outline" size={22} color={Colors.gold} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.product.price)}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                <Ionicons name="remove" size={14} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <Ionicons name="add" size={14} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.productId)} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        <GoldDivider />

        {/* Order summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Shipping {shipping === 0 ? <Text style={{ color: Colors.success }}>(Free)</Text> : ''}
            </Text>
            <Text style={styles.summaryValue}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</Text>
          </View>
          {shipping > 0 && (
            <Text style={styles.freeShippingNote}>
              Add {formatCurrency(100 - subtotal)} more for free shipping
            </Text>
          )}
          <GoldDivider style={{ marginVertical: Spacing.sm }} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Checkout CTA */}
        <Button
          label="Proceed to Checkout"
          onPress={handleCheckout}
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />

        <Text style={styles.checkoutNote}>
          Checkout powered by Stripe (coming in v2). Payment details are never stored locally.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    lineHeight: 17,
  },
  itemPrice: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.sm,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    minWidth: 20,
    textAlign: 'center',
  },
  summarySection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  summaryTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginBottom: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  freeShippingNote: {
    color: Colors.gold,
    fontSize: Typography.xs,
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  totalValue: {
    color: Colors.gold,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  checkoutNote: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  successIcon: {},
  successTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
  },
  successMessage: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});
