import { api } from './apiClient'

export interface AuthResult {
  session: {
    access_token: string
    refresh_token: string
  }
  user: {
    id: string
    email: string
    role: string
  }
}

export interface UserProfile {
  id: string
  email: string
  role: 'organizer' | 'vendor' | 'admin'
  display_name: string | null
  organizerProfile?: Record<string, unknown> | null
  vendorProfile?: Record<string, unknown> | null
}

export const authService = {
  register: (payload: { email: string; password: string; role: string; displayName?: string }) =>
    api.post<AuthResult>('/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthResult>('/auth/login', payload),

  getMe: () => api.get<UserProfile>('/auth/me'),

  syncProfile: (payload?: { role?: string }) =>
    api.post<UserProfile>('/auth/sync-profile', payload || {})
}
