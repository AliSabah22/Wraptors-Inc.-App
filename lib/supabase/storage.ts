import * as SecureStore from 'expo-secure-store';

/**
 * ExpoSecureStoreAdapter — used as the Supabase auth storage backend.
 * Stores session tokens in the device's encrypted keychain.
 */
export const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
