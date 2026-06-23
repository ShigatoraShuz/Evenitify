export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: ApiError
  meta?: Record<string, unknown>
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message?: string
  error?: ApiError
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ServiceResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: ApiError }

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'
