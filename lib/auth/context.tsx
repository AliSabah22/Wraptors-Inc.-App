import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { configureGoogleSignIn } from '@/lib/auth/helpers';
import { useAuthStore } from '@/store/authStore';
import type { Vehicle } from '@/types';

interface SupabaseAuthContextValue {
  session: Session | null;
  supabaseUser: User | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  refreshOnboarding: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  session: null,
  supabaseUser: null,
  isLoading: false,
  needsOnboarding: false,
  refreshOnboarding: async () => {},
});

async function fetchOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    // onboarding_complete added via migration — cast since types regenerate after migration
    return !(data as any)?.onboarding_complete;
  } catch {
    return false;
  }
}

/** Fetch real profile + vehicles from Supabase and hydrate the Zustand auth store. */
async function syncSupabaseUserToStore(userId: string) {
  try {
    const [profileRes, vehiclesRes] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, phone').eq('id', userId).single(),
      (supabase as any).from('vehicles').select('*').eq('customer_id', userId),
    ]);

    if (profileRes.error || !profileRes.data) return;

    const profile = profileRes.data as { id: string; email: string | null; full_name: string | null; phone?: string | null };
    const rawVehicles = ((vehiclesRes as any).data ?? []) as Array<{
      id: string; customer_id: string; make: string; model: string; year: number;
      color: string | null; license_plate: string | null; vin?: string | null; image_url?: string | null;
    }>;

    const vehicles: Vehicle[] = rawVehicles.map((v) => ({
      id: v.id,
      userId: v.customer_id,
      make: v.make,
      model: v.model,
      year: v.year,
      color: v.color ?? '',
      licensePlate: v.license_plate ?? '',
      vin: v.vin ?? undefined,
      imageUrl: v.image_url ?? undefined,
    }));

    await useAuthStore.getState().hydrateUser(profile, vehicles);
  } catch {
    // Silently skip — store keeps current state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const refreshOnboarding = async () => {
    if (!session?.user.id || !isSupabaseConfigured) return;
    const needs = await fetchOnboardingStatus(session.user.id);
    setNeedsOnboarding(needs);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    configureGoogleSignIn();

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user.id) {
        const [needs] = await Promise.all([
          fetchOnboardingStatus(data.session.user.id),
          syncSupabaseUserToStore(data.session.user.id),
        ]);
        setNeedsOnboarding(needs);
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user.id) {
        const [needs] = await Promise.all([
          fetchOnboardingStatus(s.user.id),
          syncSupabaseUserToStore(s.user.id),
        ]);
        setNeedsOnboarding(needs);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <SupabaseAuthContext.Provider
      value={{ session, supabaseUser: session?.user ?? null, isLoading, needsOnboarding, refreshOnboarding }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

/** Access Supabase auth session. Returns nulls when Supabase is not configured. */
export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext);
}
