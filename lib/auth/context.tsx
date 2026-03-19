import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface SupabaseAuthContextValue {
  session: Session | null;
  supabaseUser: User | null;
  isLoading: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  session: null,
  supabaseUser: null,
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <SupabaseAuthContext.Provider
      value={{ session, supabaseUser: session?.user ?? null, isLoading }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

/** Access Supabase auth session. Returns nulls when Supabase is not configured. */
export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext);
}
