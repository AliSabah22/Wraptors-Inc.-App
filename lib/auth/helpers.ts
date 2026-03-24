/**
 * Auth helpers — thin wrappers around Supabase Auth.
 *
 * EMAIL functions throw on error (callers use try/catch).
 * SOCIAL functions return { data, error } (callers check error field).
 *
 * SETUP REQUIRED BEFORE SOCIAL AUTH WORKS:
 *   Apple  → Apple Developer: enable Sign In with Apple capability, add service ID
 *   Google → Google Cloud Console: create OAuth 2.0 client, add iOS URL scheme
 *   Both   → Supabase Dashboard → Auth → Providers → enable each provider
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { AuthResponse } from '@supabase/supabase-js';

// ─── Email / Password ────────────────────────────────────────────────────────

/** Sign in with email + password via Supabase Auth. Throws on error. */
export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Create a new Supabase Auth account. Pass fullName to store as user metadata. Throws on error. */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: fullName ? { data: { full_name: fullName } } : undefined,
  });
  if (error) throw error;
  return data;
}

/** Send a password reset email. Throws on error. */
export async function resetPassword(email: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// ─── Social Auth ─────────────────────────────────────────────────────────────

/**
 * Sign in with Apple.
 * - iOS only (expo-apple-authentication).
 * - Uses a SHA-256 nonce (expo-crypto) to prevent replay attacks.
 * - Returns { data, error } — caller checks error field.
 */
export async function signInWithApple(): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { data: { user: null, session: null }, error: new Error('Supabase is not configured.') as any };
  }

  try {
    const AppleAuthentication = await import('expo-apple-authentication');
    const Crypto = await import('expo-crypto');

    const rawNonce = Math.random().toString(36).substring(2);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const identityToken = credential.identityToken;
    if (!identityToken) {
      return { data: { user: null, session: null }, error: new Error('No identity token from Apple.') as any };
    }

    return supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
      nonce: rawNonce,
    });
  } catch (err: any) {
    // User cancelled sign-in — err.code === 'ERR_REQUEST_CANCELED'
    return { data: { user: null, session: null }, error: err };
  }
}

/**
 * Configure Google Sign-In (call once on app start — not per sign-in attempt).
 * webClientId comes from EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID env var.
 */
export function configureGoogleSignIn() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (webClientId) {
      GoogleSignin.configure({ webClientId, offlineAccess: true });
    }
  } catch {
    // Package not available (e.g. Expo Go) — silently skip
  }
}

/**
 * Sign in with Google.
 * - Requires configureGoogleSignIn() called first (done in AuthProvider).
 * - Returns { data, error } — caller checks error field.
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { data: { user: null, session: null }, error: new Error('Supabase is not configured.') as any };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');

    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken ?? userInfo.idToken;

    if (!idToken) {
      return { data: { user: null, session: null }, error: new Error('No ID token from Google.') as any };
    }

    return supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
  } catch (err: any) {
    return { data: { user: null, session: null }, error: err };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/**
 * Sign out from Supabase Auth.
 * Also signs out from Google if the user was signed in via Google.
 */
export async function signOut() {
  if (!isSupabaseConfigured) return;

  // Best-effort Google sign-out
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // Not signed in via Google, or package unavailable — ignore
  }

  await supabase.auth.signOut();
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Get the currently authenticated Supabase user, or null. */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
