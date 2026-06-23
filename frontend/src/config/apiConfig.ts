import { env } from './env'

export type ApiMode = 'mock' | 'local' | 'production'

export function getApiMode(): ApiMode {
  if (env.apiMode === 'production') return 'production'
  if (env.apiMode === 'local') return 'local'
  return env.useMocks ? 'mock' : 'local'
}

export function isMockMode(): boolean {
  return getApiMode() === 'mock'
}

export function getApiBaseUrl(): string {
  if (getApiMode() === 'production') return env.apiBaseUrl || '/api'
  if (getApiMode() === 'local') return env.apiBaseUrl || 'http://localhost:4000/api'
  return env.apiBaseUrl || '/api'
}

export function getSupabaseUrl(): string {
  return env.supabaseUrl
}

export function getSupabaseAnonKey(): string {
  return env.supabaseAnonKey
}
