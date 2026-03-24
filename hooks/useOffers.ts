/**
 * useOffers — fetches active campaigns from Supabase (or falls back to empty).
 * Used by the Home screen offer banners and any dedicated offers section.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface Offer {
  id: string;
  title: string;
  offerHeadline: string | null;
  offerBody: string | null;
  offerCode: string | null;
  discountValue: number | null;
  discountType: 'percentage' | 'fixed' | 'none' | null;
  endDate: string | null;
  membersOnly: boolean;
  offerCta: string;
  imageUrl: string | null;
}

interface UseOffersResult {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useOffers(): UseOffersResult {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped: Offer[] = (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        offerHeadline: row.offer_headline,
        offerBody: row.offer_body,
        offerCode: row.offer_code,
        discountValue: row.discount_value,
        discountType: row.discount_type,
        endDate: row.end_date,
        membersOnly: row.members_only ?? false,
        offerCta: row.offer_cta ?? 'Book Now',
        imageUrl: row.image_url,
      }));
      setOffers(mapped);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { offers, isLoading, error, refresh: fetch };
}
