import { api, hasAuthToken } from './apiClient'

export interface AuthResult {
  session: {
    access_token: string
    refresh_token: string
  }
  user: {
    id: string
    email: string
    role: string | null
    roles?: string[]
  }
}

export type UserRole = 'organizer' | 'vendor' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole | null
  selectedRole?: UserRole | null
  roles?: UserRole[]
  display_name: string | null
  organizerProfile?: Record<string, unknown> | null
  vendorProfile?: Record<string, unknown> | null
  hasOrganizerProfile?: boolean
  hasVendorProfile?: boolean
  setupComplete?: boolean
}

export const authService = {
  register: (payload: { email: string; password: string; role?: string; displayName?: string }) =>
    api.post<AuthResult>('/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthResult>('/auth/login', payload),

  getMe: () => api.get<UserProfile>('/auth/me'),

  syncProfile: (payload?: { role?: string }) =>
    api.post<UserProfile>('/auth/sync-profile', payload || {}),

  refreshSession: (refreshToken: string) =>
    api.post<AuthResult>('/auth/refresh', { refreshToken }),

  logout: () => {
    if (!hasAuthToken()) return Promise.resolve()
    return api.post<void>('/auth/logout', {})
  },
}
