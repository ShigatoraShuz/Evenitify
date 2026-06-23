import { getMockResponse } from './mock/mockAdapter'
import { isMockMode, getApiBaseUrl } from '../config/apiConfig'
import type { ApiResponse } from './types'

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('supabase.auth.token')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.access_token || null
  } catch {
    return null
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (isMockMode()) {
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

  const apiBase = getApiBaseUrl()
  const res = await fetch(`${apiBase}${endpoint}`, {
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
