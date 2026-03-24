/**
 * Quote Store — Zustand
 *
 * FUTURE: POST quote requests to a backend API or Supabase table.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuoteRequest } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const QUOTES_STORAGE_KEY = '@wraptors_quotes';

interface QuoteState {
  quotes: QuoteRequest[];
  isSubmitting: boolean;

  loadQuotes: () => Promise<void>;
  submitQuote: (quote: Omit<QuoteRequest, 'id' | 'submittedAt' | 'status'>) => Promise<string>;
  getQuoteById: (id: string) => QuoteRequest | undefined;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: [],
  isSubmitting: false,

  loadQuotes: async () => {
    try {
      const stored = await AsyncStorage.getItem(QUOTES_STORAGE_KEY);
      if (stored) set({ quotes: JSON.parse(stored) });
    } catch {
      // ignore
    }
  },

  submitQuote: async (quoteData) => {
    set({ isSubmitting: true });

    // Try writing to Supabase when configured
    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await (supabase as any)
          .from('quote_requests')
          .insert({
            customer_id: quoteData.userId ?? null,
            customer_name: quoteData.name,
            customer_email: quoteData.email,
            customer_phone: quoteData.phone,
            vehicle_info: quoteData.vehicleInfo,
            service_categories: quoteData.serviceCategories,
            service_details: quoteData.serviceDetails,
            additional_info: quoteData.additionalInfo ?? null,
            source: 'app',
          })
          .select('id')
          .single();

        if (!error && inserted) {
          const newQuote: QuoteRequest = {
            ...quoteData,
            id: inserted.id,
            submittedAt: new Date().toISOString(),
            status: 'submitted',
          };
          const updated = [newQuote, ...get().quotes];
          set({ quotes: updated, isSubmitting: false });
          await AsyncStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(updated));
          return newQuote.id;
        }
      } catch {
        // Fall through to local-only
      }
    }

    // Local-only fallback
    await new Promise((r) => setTimeout(r, 1200));
    const newQuote: QuoteRequest = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    const updated = [newQuote, ...get().quotes];
    set({ quotes: updated, isSubmitting: false });
    await AsyncStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(updated));
    return newQuote.id;
  },

  getQuoteById: (id: string) => get().quotes.find((q) => q.id === id),
}));
