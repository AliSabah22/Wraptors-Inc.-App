/**
 * Validates required environment variables at startup (development only).
 * Call once from the root layout if you want early warnings.
 */
const REQUIRED_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
] as const;

export function validateEnv() {
  if (process.env.NODE_ENV !== 'development') return;

  const missing = REQUIRED_VARS.filter(
    (key) => !process.env[key] || process.env[key] === ''
  );

  if (missing.length > 0) {
    console.warn(
      '[env] Missing optional environment variables:\n' +
        missing.map((k) => `  • ${k}`).join('\n') +
        '\nThe app will run in mock-auth mode.'
    );
  }
}
