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

export interface OnboardingStatusResponse {
  completed: boolean
  role: 'organizer' | 'vendor' | 'admin'
}

export interface ProfileUpdateResponse {
  id?: string
  updatedAt?: string
  profileComplete?: boolean
}

export interface ReportRequest {
  role: 'organizer' | 'vendor' | 'admin'
  dateFrom?: string
  dateTo?: string
  format?: 'json' | 'csv' | 'pdf'
}

export interface DocumentUploadRequest {
  ownerId: string
  title: string
  fileName: string
  contentType?: string
}

export interface AuditActivityRequest {
  scope: string
  limit?: number
}

export interface RealtimeSnapshotRequest {
  channel: string
}
