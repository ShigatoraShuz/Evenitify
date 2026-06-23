import { useState, useEffect, useCallback } from 'react'
import { authService, type UserProfile } from '../../../services/authService'
import { onboardingService } from '../../../services/onboardingService'
import type { AuthState } from '../models/auth.model'

const USER_CACHE_KEY = 'auth_user_cache'

interface AuthSessionState {
  user: UserProfile | null
  loading: boolean
  error: string | null
  profileComplete: boolean
}

function cacheUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_CACHE_KEY)
  }
}

function getCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

function getStoredSession(): boolean {
  try {
    const raw = localStorage.getItem('supabase.auth.token')
    return !!raw
  } catch {
    return false
  }
}

export function getAuthState(user: UserProfile | null, loading: boolean, profileComplete: boolean): AuthState {
  if (loading) return 'loading'
  if (!user) return 'unauthenticated'
  if (!profileComplete) return 'incomplete_profile'
  return 'authenticated'
}

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>({
    user: getCachedUser(),
    loading: getStoredSession(),
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
      cacheUser(user)
      setState({ user, loading: false, error: null, profileComplete })
    } catch {
      const cached = getCachedUser()
      const hasSession = getStoredSession()
      setState({ user: hasSession ? cached : null, loading: false, error: null, profileComplete: true })
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
      if (result.user) {
        cacheUser(result.user as unknown as UserProfile)
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

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Server-side logout is best-effort; always clear local state
    }
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('onboarding_complete')
    cacheUser(null)
    setState({ user: null, loading: false, error: null, profileComplete: true })
  }, [])

  const setProfileComplete = useCallback(() => {
    localStorage.setItem('onboarding_complete', 'true')
    setState((s) => ({ ...s, profileComplete: true }))
  }, [])

  const authState = getAuthState(state.user, state.loading, state.profileComplete)

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    profileComplete: state.profileComplete,
    authState,
    login,
    register,
    logout,
    reload: loadSession,
    setProfileComplete
  }
}
