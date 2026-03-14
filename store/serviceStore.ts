/**
 * Service Store — Zustand
 *
 * FUTURE: Connect to Supabase realtime subscriptions for live job updates:
 *   supabase.from('service_jobs').on('UPDATE', handler).subscribe()
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceJob, ServiceStage, StageStatus } from '@/types';
import { MOCK_ACTIVE_JOBS } from '@/data/mockData';

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
    try {
      // FUTURE: const { data } = await supabase.from('service_jobs').select('*').eq('user_id', userId)
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
  },
}));

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
