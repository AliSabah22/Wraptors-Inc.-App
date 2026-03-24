import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ExpoSecureStoreAdapter — used as the Supabase auth storage backend.
 * Stores session tokens in the device keychain, falls back to AsyncStorage
 * if SecureStore is unavailable (simulator first-boot, old OS, etc.).
 */
/** Validate a storage value is parseable JSON; return null if not. */
function validateJson(value: string | null): string | null {
  if (value === null) return null;
  try {
    JSON.parse(value);
    return value;
  } catch {
    return null;
  }
}

export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    // Try SecureStore first, fall back to AsyncStorage on any error
    let value: string | null = null;
    try {
      value = await SecureStore.getItemAsync(key);
    } catch {
      try {
        value = await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
    // Guard: if SecureStore returned null, also check AsyncStorage fallback
    if (value === null) {
      try {
        value = await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
    // Return only valid JSON to prevent auth library parse errors
    return validateJson(value);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    // Try SecureStore; if it rejects (e.g. value too large on simulator),
    // persist to AsyncStorage instead so getItem can find it.
    try {
      await SecureStore.setItemAsync(key, value);
      // Mirror to AsyncStorage so our fallback path in getItem works
      await AsyncStorage.setItem(key, value);
    } catch {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        // Ignore — auth will re-request credentials
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try { await SecureStore.deleteItemAsync(key); } catch { /* ignore */ }
    try { await AsyncStorage.removeItem(key); } catch { /* ignore */ }
  },
};
