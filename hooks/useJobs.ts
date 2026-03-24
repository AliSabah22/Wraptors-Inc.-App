/**
 * useJobs — fetches the current user's active service jobs from Supabase.
 * Thin hook wrapper over serviceStore.loadJobs for components that want
 * reactive loading state without wiring into the store directly.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useServiceStore } from '@/store/serviceStore';
import type { ServiceJob } from '@/types';

interface UseJobsResult {
  jobs: ServiceJob[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useJobs(): UseJobsResult {
  const { user } = useAuthStore();
  const { activeJobs, loadJobs, isLoading } = useServiceStore();
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    try {
      await loadJobs(user.id);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load jobs');
    }
  }, [user?.id, loadJobs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { jobs: activeJobs, isLoading, error, refresh };
}
