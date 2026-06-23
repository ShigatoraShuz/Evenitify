import { useState, useCallback, useRef } from 'react'

interface MutationState {
  submitting: boolean
  error: string | null
}

interface UseMutationStateReturn {
  submitting: boolean
  error: string | null
  execute: <T>(fn: () => Promise<T>) => Promise<T | undefined>
  clearError: () => void
  reset: () => void
}

export function useMutationState(): UseMutationStateReturn {
  const [state, setState] = useState<MutationState>({ submitting: false, error: null })
  const submitCount = useRef(0)

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    submitCount.current += 1
    const currentCount = submitCount.current

    setState({ submitting: true, error: null })

    try {
      const result = await fn()
      if (currentCount === submitCount.current) {
        setState({ submitting: false, error: null })
      }
      return result
    } catch (err) {
      if (currentCount === submitCount.current) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setState({ submitting: false, error: message })
      }
      return undefined
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const reset = useCallback(() => {
    submitCount.current = 0
    setState({ submitting: false, error: null })
  }, [])

  return {
    submitting: state.submitting,
    error: state.error,
    execute,
    clearError,
    reset
  }
}
