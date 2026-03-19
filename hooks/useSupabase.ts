import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

/** Returns the Supabase client and a flag indicating whether it is configured. */
export function useSupabase() {
  return { supabase, isSupabaseConfigured };
}
