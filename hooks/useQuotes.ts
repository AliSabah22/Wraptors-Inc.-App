/**
 * useQuotes — fetches the current user's quote requests from Supabase.
 * Falls back to the local store when Supabase is unconfigured or the
 * user is not authenticated.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/lib/auth/context';
import type { QuoteRequest, QuoteStatus, ServiceCategory } from '@/types';

interface UseQuotesResult {
  quotes: QuoteRequest[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useQuotes(): UseQuotesResult {
  const { supabaseUser } = useSupabaseAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured || !supabaseUser?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await (supabase as any)
        .from('quote_requests')
        .select('*')
        .eq('customer_id', supabaseUser.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped: QuoteRequest[] = (data ?? []).map((row: any) => ({
        id: row.id,
        userId: row.customer_id,
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        vehicleInfo: row.vehicle_info,
        serviceCategories: (row.service_categories ?? []) as ServiceCategory[],
        serviceDetails: row.service_details ?? '',
        additionalInfo: row.additional_info ?? undefined,
        imageUris: [],
        status: (row.status ?? 'submitted') as QuoteStatus,
        submittedAt: row.created_at,
        quotedPrice: row.quoted_price ?? undefined,
        quotedAt: row.quoted_at ?? undefined,
      }));
      setQuotes(mapped);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { quotes, isLoading, error, refresh: fetch };
}
