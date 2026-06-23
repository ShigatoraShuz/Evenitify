const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: Record<string, unknown>
  error?: { code: string; message: string }
}

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
