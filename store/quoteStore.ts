/**
 * Quote Store — Zustand
 *
 * FUTURE: POST quote requests to a backend API or Supabase table.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuoteRequest } from '@/types';

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

    // FUTURE: const { data } = await supabase.from('quotes').insert(quoteData)
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
