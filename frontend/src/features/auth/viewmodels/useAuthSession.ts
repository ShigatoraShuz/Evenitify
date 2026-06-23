import { useState, useEffect, useCallback } from 'react'
import { authService, type UserProfile } from '../../../services/authService'

interface AuthSessionState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>({
    user: null,
    loading: true,
    error: null
  })

  const loadSession = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const user = await authService.getMe()
      setState({ user, loading: false, error: null })
    } catch {
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => { loadSession() }, [loadSession])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const result = await authService.login({ email, password })
      if (result.session?.access_token) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(result.session))
      }
      await loadSession()
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
      throw err
    }
  }, [loadSession])

  const register = useCallback(async (email: string, password: string, role: string, displayName: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await authService.register({ email, password, role, displayName })
      await login(email, password)
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
      throw err
    }
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('supabase.auth.token')
    setState({ user: null, loading: false, error: null })
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    reload: loadSession
  }
}
