import type { ApiError } from '../../services/types'

const SENSITIVE_KEYWORDS = ['token', 'secret', 'key', 'password', 'authorization', 'bearer']

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return sanitizeErrorMessage(error)
  if (error instanceof Error) return sanitizeErrorMessage(error.message)
  if (error && typeof error === 'object') {
    const apiErr = error as { error?: ApiError; message?: string }
    if (apiErr.error?.message) return sanitizeErrorMessage(apiErr.error.message)
    if (apiErr.message) return sanitizeErrorMessage(apiErr.message)
  }
  return 'An unexpected error occurred. Please try again.'
}

export function getErrorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    const apiErr = error as { error?: ApiError; code?: string }
    if (apiErr.error?.code) return apiErr.error.code
    if (apiErr.code) return apiErr.code
  }
  return 'UNKNOWN_ERROR'
}

function sanitizeErrorMessage(message: string): string {
  const lower = message.toLowerCase()
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lower.includes(keyword)) {
      return 'An unexpected error occurred. Please try again.'
    }
  }
  return message
}
