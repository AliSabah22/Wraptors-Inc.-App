/**
 * Cart Store — Zustand
 *
 * FUTURE: Connect to Stripe Checkout or a backend cart API.
 * For MVP: in-memory cart with AsyncStorage persistence.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, StoreProduct } from '@/types';

const CART_STORAGE_KEY = '@wraptors_cart';

interface CartState {
  items: CartItem[];
  isLoading: boolean;

  loadCart: () => Promise<void>;
  addItem: (product: StoreProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  loadCart: async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) set({ items: JSON.parse(stored) });
    } catch {
      // ignore
    }
  },

  addItem: async (product: StoreProduct) => {
    const items = get().items;
    const existing = items.find((i) => i.productId === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = items.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updated = [...items, { productId: product.id, product, quantity: 1 }];
    }
    set({ items: updated });
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
  },

  removeItem: async (productId: string) => {
    const updated = get().items.filter((i) => i.productId !== productId);
    set({ items: updated });
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
  },

  updateQuantity: async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeItem(productId);
      return;
    }
    const updated = get().items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    set({ items: updated });
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
  },

  clearCart: async () => {
    set({ items: [] });
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));
