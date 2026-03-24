/**
 * useReferrals — fetches referral stats for the current user from Supabase.
 * Returns { referralCount, referralCredits } — falls back to 0 when not configured.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface UseReferralsResult {
  referralCount: number;
  referralCredits: number;
  isLoading: boolean;
  refresh: () => void;
}

export function useReferrals(): UseReferralsResult {
  const [referralCount, setReferralCount] = useState(0);
  const [referralCredits, setReferralCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('referral_count, referral_credits')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setReferralCount(data.referral_count ?? 0);
        setReferralCredits(parseFloat(data.referral_credits ?? '0'));
      }
    } catch {
      // Leave defaults at 0
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { referralCount, referralCredits, isLoading, refresh: fetch };
}
