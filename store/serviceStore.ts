/**
 * Service Store — Zustand
 *
 * FUTURE: Connect to Supabase realtime subscriptions for live job updates:
 *   supabase.from('service_jobs').on('UPDATE', handler).subscribe()
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceJob, ServiceStage, StageStatus, Vehicle } from '@/types';
import { MOCK_ACTIVE_JOBS } from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const JOBS_STORAGE_KEY = '@wraptors_jobs';

interface ServiceState {
  activeJobs: ServiceJob[];
  isLoading: boolean;

  // Customer actions
  loadJobs: (userId: string) => Promise<void>;
  getJobById: (id: string) => ServiceJob | undefined;

  // Staff / internal actions
  updateStageStatus: (jobId: string, stageId: string, status: StageStatus, note?: string) => Promise<void>;
  addTechnicianNote: (jobId: string, stageId: string, note: string) => Promise<void>;
  advanceToNextStage: (jobId: string) => Promise<void>;
  markJobComplete: (jobId: string) => Promise<void>;
}

function recalcProgress(stages: ServiceStage[]): number {
  const completed = stages.filter((s) => s.status === 'completed');
  const inProgress = stages.filter((s) => s.status === 'in_progress');
  if (inProgress.length > 0) return inProgress[inProgress.length - 1].progressPercent;
  if (completed.length === stages.length) return 100;
  if (completed.length === 0) return 0;
  return completed[completed.length - 1].progressPercent;
}

function getCurrentStageName(stages: ServiceStage[]): string {
  const inProgress = stages.find((s) => s.status === 'in_progress');
  if (inProgress) return inProgress.name;
  const pending = stages.find((s) => s.status === 'pending');
  if (pending) return pending.name;
  return 'Vehicle Delivery';
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  activeJobs: [],
  isLoading: false,

  loadJobs: async (userId: string) => {
    set({ isLoading: true });

    // Try Supabase first when configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any)
          .from('service_jobs')
          .select('*, vehicles(*)')
          .eq('customer_id', userId)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const jobs: ServiceJob[] = data.map((row: any) => {
            const v = row.vehicles as any;
            const vehicle: Vehicle = v
              ? { id: v.id, userId: v.customer_id, make: v.make, model: v.model, year: v.year, color: v.color ?? '', licensePlate: v.license_plate ?? '', vin: v.vin ?? undefined, imageUrl: v.image_url ?? undefined }
              : { id: row.vehicle_id ?? '', userId, make: 'Unknown', model: 'Vehicle', year: new Date().getFullYear(), color: '', licensePlate: '' };
            const stages: ServiceStage[] = Array.isArray(row.stages) ? row.stages : [];
            return {
              id: row.id,
              userId: row.customer_id,
              vehicleId: row.vehicle_id ?? '',
              vehicle,
              serviceType: row.service_type,
              serviceCategory: row.service_category,
              description: row.notes ?? '',
              status: row.status,
              progressPercent: row.progress_percent,
              currentStageName: row.current_stage_name,
              estimatedCompletion: row.estimated_completion ?? new Date().toISOString(),
              startedAt: row.started_at ?? row.created_at,
              completedAt: row.completed_at ?? undefined,
              technicianName: row.technician_name ?? 'Wraptors Team',
              stages,
              notes: row.notes ?? undefined,
              totalCost: row.total_cost ?? undefined,
              invoiceUrl: row.invoice_url ?? undefined,
            };
          });
          set({ activeJobs: jobs, isLoading: false });
          return;
        }
      } catch {
        // Fall through to mock
      }
    }

    // Fall back to AsyncStorage / mock data
    try {
      const stored = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        const jobs: ServiceJob[] = JSON.parse(stored);
        const userJobs = jobs.filter((j) => j.userId === userId);
        set({ activeJobs: userJobs, isLoading: false });
      } else {
        const userJobs = MOCK_ACTIVE_JOBS.filter((j) => j.userId === userId);
        await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(MOCK_ACTIVE_JOBS));
        set({ activeJobs: userJobs, isLoading: false });
      }
    } catch {
      const userJobs = MOCK_ACTIVE_JOBS.filter((j) => j.userId === userId);
      set({ activeJobs: userJobs, isLoading: false });
    }
  },

  getJobById: (id: string) => {
    return get().activeJobs.find((j) => j.id === id);
  },

  updateStageStatus: async (jobId, stageId, status, note) => {
    const jobs = get().activeJobs;
    const updated = jobs.map((job) => {
      if (job.id !== jobId) return job;
      const updatedStages = job.stages.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : stage.completedAt,
          technicianNote: note ?? stage.technicianNote,
        };
      });
      const progress = recalcProgress(updatedStages);
      return {
        ...job,
        stages: updatedStages,
        progressPercent: progress,
        currentStageName: getCurrentStageName(updatedStages),
        status: progress === 100 ? ('completed' as const) : ('in_progress' as const),
      };
    });

    set({ activeJobs: updated });
    await persistAllJobs(updated);
    const changedJob = updated.find((j) => j.id === jobId);
    if (changedJob) await persistJobToSupabase(changedJob);
  },

  addTechnicianNote: async (jobId, stageId, note) => {
    const jobs = get().activeJobs;
    const updated = jobs.map((job) => {
      if (job.id !== jobId) return job;
      const updatedStages = job.stages.map((stage) => {
        if (stage.id !== stageId) return stage;
        return { ...stage, technicianNote: note };
      });
      return { ...job, stages: updatedStages };
    });
    set({ activeJobs: updated });
    await persistAllJobs(updated);
    const changedJob = updated.find((j) => j.id === jobId);
    if (changedJob) await persistJobToSupabase(changedJob);
  },

  advanceToNextStage: async (jobId) => {
    const jobs = get().activeJobs;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const currentInProgress = job.stages.find((s) => s.status === 'in_progress');
    const firstPending = job.stages.find((s) => s.status === 'pending');

    const updated = jobs.map((j) => {
      if (j.id !== jobId) return j;
      const updatedStages = j.stages.map((stage) => {
        if (currentInProgress && stage.id === currentInProgress.id) {
          return { ...stage, status: 'completed' as StageStatus, completedAt: new Date().toISOString() };
        }
        if (firstPending && stage.id === firstPending.id) {
          return { ...stage, status: 'in_progress' as StageStatus };
        }
        return stage;
      });
      const progress = recalcProgress(updatedStages);
      return {
        ...j,
        stages: updatedStages,
        progressPercent: progress,
        currentStageName: getCurrentStageName(updatedStages),
      };
    });

    set({ activeJobs: updated });
    await persistAllJobs(updated);
    const changedJob = updated.find((j) => j.id === jobId);
    if (changedJob) await persistJobToSupabase(changedJob);
  },

  markJobComplete: async (jobId) => {
    const jobs = get().activeJobs;
    const updated = jobs.map((job) => {
      if (job.id !== jobId) return job;
      const updatedStages = job.stages.map((s) => ({
        ...s,
        status: 'completed' as StageStatus,
        completedAt: s.completedAt ?? new Date().toISOString(),
      }));
      return {
        ...job,
        stages: updatedStages,
        progressPercent: 100,
        status: 'completed' as const,
        currentStageName: 'Vehicle Delivery',
        completedAt: new Date().toISOString(),
      };
    });
    set({ activeJobs: updated });
    await persistAllJobs(updated);
    const changedJob = updated.find((j) => j.id === jobId);
    if (changedJob) await persistJobToSupabase(changedJob);
  },
}));

/** Persist updated job fields to Supabase (best-effort, non-blocking). */
async function persistJobToSupabase(job: ServiceJob) {
  if (!isSupabaseConfigured) return;
  // Only real Supabase UUIDs — mock IDs like 'j1' are skipped
  if (!/^[0-9a-f-]{36}$/.test(job.id)) return;
  try {
    await (supabase as any)
      .from('service_jobs')
      .update({
        stages: job.stages,
        progress_percent: job.progressPercent,
        current_stage_name: job.currentStageName,
        status: job.status,
        completed_at: job.completedAt ?? null,
        notes: job.notes ?? null,
      })
      .eq('id', job.id);
  } catch {
    // Non-blocking — AsyncStorage is the source of truth for the session
  }
}

async function persistAllJobs(jobs: ServiceJob[]) {
  try {
    // Load all jobs including other users' jobs
    const stored = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    const all: ServiceJob[] = stored ? JSON.parse(stored) : MOCK_ACTIVE_JOBS;
    const jobIds = jobs.map((j) => j.id);
    const others = all.filter((j) => !jobIds.includes(j.id));
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify([...others, ...jobs]));
  } catch {
    // ignore
  }
}
