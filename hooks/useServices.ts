/**
 * useServices — fetches the services catalog from Supabase.
 * Falls back to empty list when not configured or on error.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ServiceItem, ServiceCategory } from '@/types';

interface UseServicesResult {
  services: ServiceItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await (supabase as any)
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('popular', { ascending: false });

      if (err) throw err;

      const mapped: ServiceItem[] = (data ?? []).map((row: any) => ({
        id: row.id,
        category: row.category as ServiceCategory,
        name: row.name,
        tagline: row.tagline ?? '',
        description: row.description ?? '',
        benefits: row.benefits ?? [],
        priceRange: row.price_range ?? '',
        estimatedDays: row.estimated_days ?? '',
        imageUrl: row.image_url ?? undefined,
        popular: row.popular ?? false,
      }));
      setServices(mapped);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { services, isLoading, error, refresh: fetch };
}
