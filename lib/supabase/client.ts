import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { ExpoSecureStoreAdapter } from './storage';
import { rnFetch } from './rnFetch';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/**
 * Supabase singleton client.
 * Auth sessions are persisted in the device keychain via expo-secure-store.
 */
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    // React Native's fetch polyfill has a bug where Response.text() returns
    // a Blob object that stringifies to "[object Object]", breaking JSON.parse.
    // XHR's responseText always gives a proper UTF-8 string.
    fetch: rnFetch,
  },
});
