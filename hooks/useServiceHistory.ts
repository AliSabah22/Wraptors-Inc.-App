/**
 * useServiceHistory — fetches completed/cancelled service jobs from Supabase.
 * Falls back to empty list when not configured or on error.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ServiceHistoryRecord, ServiceCategory } from '@/types';

interface UseServiceHistoryResult {
  history: ServiceHistoryRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useServiceHistory(): UseServiceHistoryResult {
  const [history, setHistory] = useState<ServiceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await (supabase as any)
        .from('service_jobs')
        .select('*, vehicles(*)')
        .in('status', ['completed', 'cancelled'])
        .order('completed_at', { ascending: false });

      if (err) throw err;

      const mapped: ServiceHistoryRecord[] = (data ?? []).map((row: any) => ({
        id: row.id,
        jobId: row.id,
        userId: row.customer_id,
        vehicle: {
          id: row.vehicles?.id ?? '',
          userId: row.customer_id,
          make: row.vehicles?.make ?? '',
          model: row.vehicles?.model ?? '',
          year: row.vehicles?.year ?? 0,
          color: row.vehicles?.color ?? '',
          licensePlate: row.vehicles?.license_plate ?? '',
          vin: row.vehicles?.vin ?? undefined,
          imageUrl: row.vehicles?.image_url ?? undefined,
        },
        serviceType: row.service_type,
        serviceCategory: (row.service_category ?? 'custom') as ServiceCategory,
        completedAt: row.completed_at ?? row.created_at,
        finalStatus: row.status as 'completed' | 'cancelled',
        totalCost: parseFloat(row.total_cost ?? '0'),
        thumbnailUrl: undefined,
        technicianName: row.technician_name ?? 'Wraptors Team',
        stages: [],
        invoicePlaceholder: '',
        nextServiceRecommendation: '',
        rating: undefined,
      }));
      setHistory(mapped);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load service history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { history, isLoading, error, refresh: fetch };
}
