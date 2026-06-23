/**
 * Frontend-safe environment variable handling.
 * Only exposes VITE_ prefixed variables to the client bundle.
 * Never import `import.meta.env` directly outside this file.
 */

export function getEnvVar(name: string, fallback = ''): string {
  const key = `VITE_${name}` as keyof ImportMetaEnv
  const value = import.meta.env[key]
  if (value === undefined || value === null) return fallback
  return String(value)
}

export function getEnvVarBoolean(name: string, fallback = false): boolean {
  const val = getEnvVar(name, String(fallback))
  return val === 'true' || val === '1'
}

export function getEnvVarNumber(name: string, fallback = 0): number {
  const val = getEnvVar(name, String(fallback))
  const parsed = Number(val)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  useMocks: getEnvVarBoolean('USE_MOCKS', true),
  apiBaseUrl: getEnvVar('API_BASE_URL', ''),
  supabaseUrl: getEnvVar('SUPABASE_URL', ''),
  supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', ''),
  appName: getEnvVar('APP_NAME', 'Eventify'),
  appVersion: getEnvVar('APP_VERSION', '1.0.0'),
}
