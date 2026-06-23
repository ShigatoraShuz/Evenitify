import { useState, useCallback, useRef } from 'react'
import type { MutationStateMeta } from '../types/viewModelState'

interface MutationState {
  submitting: boolean
  error: string | null
  success: boolean
}

interface UseMutationStateReturn extends MutationStateMeta {
  submitting: boolean
  error: string | null
  execute: <T>(fn: () => Promise<T>) => Promise<T | undefined>
  clearError: () => void
  reset: () => void
}

export function useMutationState(): UseMutationStateReturn {
  const [state, setState] = useState<MutationState>({ submitting: false, error: null, success: false })
  const submitCount = useRef(0)

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    submitCount.current += 1
    const currentCount = submitCount.current

    setState({ submitting: true, error: null, success: false })

    try {
      const result = await fn()
      if (currentCount === submitCount.current) {
        setState({ submitting: false, error: null, success: true })
      }
      return result
    } catch (err) {
      if (currentCount === submitCount.current) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setState({ submitting: false, error: message, success: false })
      }
      return undefined
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const reset = useCallback(() => {
    submitCount.current = 0
    setState({ submitting: false, error: null, success: false })
  }, [])

  return {
    submitting: state.submitting,
    error: state.error,
    mutationStatus: state.submitting ? 'submitting' : state.error ? 'error' : state.success ? 'success' : 'idle',
    mutationError: state.error,
    mutationSuccess: state.success,
    execute,
    clearError,
    reset
  }
}
