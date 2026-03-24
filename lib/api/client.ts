/**
 * API client helpers.
 *
 * portalFetch — hits the Wraptors portal (Next.js server, EXPO_PUBLIC_PORTAL_URL).
 *   Use for operations that require admin / service-role access.
 *   Falls back gracefully when the portal is not yet deployed.
 *
 * supabase — direct Supabase client (re-exported for convenience).
 *   Use for customer-facing reads/writes where RLS is sufficient.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export { supabase, isSupabaseConfigured };

const PORTAL_URL = process.env.EXPO_PUBLIC_PORTAL_URL ?? '';

/** POST to the portal API. Returns null when portal is unreachable or not configured. */
export async function portalFetch<T = unknown>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T | null> {
  if (!PORTAL_URL) return null;
  try {
    const res = await fetch(`${PORTAL_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
