import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { configureGoogleSignIn } from '@/lib/auth/helpers';

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
        const needs = await fetchOnboardingStatus(data.session.user.id);
        setNeedsOnboarding(needs);
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user.id) {
        const needs = await fetchOnboardingStatus(s.user.id);
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
