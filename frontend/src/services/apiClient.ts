import { getMockResponse } from './mock/mockAdapter'
import type { ApiResponse } from './types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_USE_MOCKS

const API_BASE = '/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('supabase.auth.token')
    ? JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.access_token
    : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (USE_MOCKS) {
    const mockResult = getMockResponse<T>(
      options.method || 'GET',
      endpoint,
      options.body ? JSON.parse(options.body as string) : undefined
    )
    if (mockResult !== undefined) {
      await new Promise((r) => setTimeout(r, 200))
      return mockResult
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  const json: ApiResponse<T> = await res.json()

  if (!json.success) {
    throw new Error(json.error?.message || 'Request failed')
  }

  return json.data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' })
}
