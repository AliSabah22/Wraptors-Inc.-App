/**
 * useProfile — fetches the current user's Supabase profile, vehicles, and notifications.
 * Designed to complement the Zustand authStore — use this for explicit refresh / display.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/lib/auth/context';
import type { Vehicle } from '@/types';

interface ProfileData {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  membershipTier: string | null;
  membershipExpiry: string | null;
  createdAt: string | null;
}

interface UseProfileResult {
  profile: ProfileData | null;
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProfile(): UseProfileResult {
  const { supabaseUser } = useSupabaseAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured || !supabaseUser?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, vehiclesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', supabaseUser.id).single(),
        (supabase as any).from('vehicles').select('*').eq('customer_id', supabaseUser.id).order('created_at'),
      ]);

      if (profileRes.error) throw profileRes.error;

      const p = profileRes.data as any;
      setProfile({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        phone: p.phone ?? null,
        avatarUrl: p.avatar_url ?? null,
        membershipTier: p.membership_tier ?? null,
        membershipExpiry: p.membership_expiry ?? null,
        createdAt: p.created_at ?? null,
      });

      const v = (vehiclesRes.data ?? []) as Array<any>;
      setVehicles(v.map((row) => ({
        id: row.id,
        userId: row.customer_id,
        make: row.make,
        model: row.model,
        year: row.year,
        color: row.color ?? '',
        licensePlate: row.license_plate ?? '',
        vin: row.vin ?? undefined,
        imageUrl: row.image_url ?? undefined,
      })));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, vehicles, isLoading, error, refresh: fetch };
}
