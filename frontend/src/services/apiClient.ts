import { getApiBaseUrl } from '../config/apiConfig'
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

export function hasAuthToken(): boolean {
  return getAuthToken() !== null
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const apiBase = getApiBaseUrl()
  const res = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers
  })

  const json: ApiResponse<T> = await res.json()

  if (!json.success) {
    throw new ApiError(json.error?.message || 'Request failed', res.status, json.error?.code)
  }

  return json.data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  postForm: <T>(endpoint: string, body: FormData) =>
    request<T>(endpoint, { method: 'POST', body }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' })
}
