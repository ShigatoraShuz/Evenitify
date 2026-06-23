import { env } from './env'

export function isMockMode(): boolean {
  return env.useMocks
}

export function getApiBaseUrl(): string {
  return env.apiBaseUrl || '/api'
}

export function getSupabaseUrl(): string {
  return env.supabaseUrl
}

export function getSupabaseAnonKey(): string {
  return env.supabaseAnonKey
}
