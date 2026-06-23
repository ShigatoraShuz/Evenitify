import { useState, useEffect, useCallback } from 'react'
import { authService, type UserProfile } from '../../../services/authService'
import { onboardingService } from '../../../services/onboardingService'

interface AuthSessionState {
  user: UserProfile | null
  loading: boolean
  error: string | null
  profileComplete: boolean
}

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>({
    user: null,
    loading: true,
    error: null,
    profileComplete: true
  })

  const checkProfileComplete = useCallback(async (user: UserProfile) => {
    try {
      const status = await onboardingService.getStatus()
      return status.completed
    } catch {
      const local = localStorage.getItem('onboarding_complete')
      if (local !== null) return local === 'true'
      return !!(user.organizerProfile || user.vendorProfile)
    }
  }, [])

  const loadSession = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const user = await authService.getMe()
      const profileComplete = await checkProfileComplete(user)
      setState({ user, loading: false, error: null, profileComplete })
    } catch {
      setState({ user: null, loading: false, error: null, profileComplete: true })
    }
  }, [checkProfileComplete])

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
    localStorage.removeItem('onboarding_complete')
    setState({ user: null, loading: false, error: null, profileComplete: true })
  }, [])

  const setProfileComplete = useCallback(() => {
    localStorage.setItem('onboarding_complete', 'true')
    setState((s) => ({ ...s, profileComplete: true }))
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    profileComplete: state.profileComplete,
    login,
    register,
    logout,
    reload: loadSession,
    setProfileComplete
  }
}
