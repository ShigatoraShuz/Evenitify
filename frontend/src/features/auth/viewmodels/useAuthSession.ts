import { useState, useEffect, useCallback, useRef } from 'react'
import { authService, type UserProfile, type UserRole } from '../../../services/authService'
import { onboardingService } from '../../../services/onboardingService'
import type { AuthState } from '../models/auth.model'

const USER_CACHE_KEY = 'auth_user_cache'
const CHOSEN_ROLES_KEY = 'eventify_chosen_roles'
const ACTIVE_ROLE_KEY = 'eventify_active_role'
const AUTH_SESSION_EVENT = 'eventify_auth_session_changed'

function clearSetupCache() {
  localStorage.removeItem('onboarding_complete')
  localStorage.removeItem('onboarding_data')
  localStorage.removeItem('profile_organizer')
  localStorage.removeItem('profile_vendor')
  localStorage.removeItem('onboarding_vendor_complete')
}

interface AuthSessionState {
  user: UserProfile | null
  loading: boolean
  error: string | null
  profileComplete: boolean
  activeRole: UserRole | null
}

function cacheUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_CACHE_KEY)
  }
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

function getCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

function getChosenRoles(): UserRole[] {
  try {
    const raw = localStorage.getItem(CHOSEN_ROLES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((role): role is UserRole => ['organizer', 'vendor', 'admin'].includes(role)) : []
  } catch {
    return []
  }
}

function setChosenRoles(roles: UserRole[]) {
  localStorage.setItem(CHOSEN_ROLES_KEY, JSON.stringify(roles))
}

function getUserRoles(user: UserProfile | null): UserRole[] {
  if (!user) return []
  if (user.roles?.length) return user.roles
  return user.role ? [user.role] : []
}

function hasSetupForRole(user: UserProfile, role: UserRole) {
  if (role === 'admin') return true
  if (role === 'organizer') return !!(user.hasOrganizerProfile ?? user.organizerProfile)
  if (role === 'vendor') return !!(user.hasVendorProfile ?? user.vendorProfile)
  return false
}

function getActiveRole(user: UserProfile | null): UserRole | null {
  const roles = getUserRoles(user)
  if (roles.length === 0) return null
  const stored = localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole | null
  if (stored && roles.includes(stored)) return stored
  return user?.role && roles.includes(user.role) ? user.role : roles[0]
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
  const cachedUser = getCachedUser()
  const hasStoredSession = getStoredSession()
  const sessionChecked = useRef(false)
  const [state, setState] = useState<AuthSessionState>({
    user: hasStoredSession ? cachedUser : null,
    loading: hasStoredSession,
    error: null,
    profileComplete: true,
    activeRole: getActiveRole(hasStoredSession ? cachedUser : null)
  })

  const checkProfileComplete = useCallback(async (user: UserProfile) => {
    const chosenRoles = getChosenRoles()
    if (chosenRoles.length > 0) {
      return chosenRoles.every((role) => hasSetupForRole(user, role))
    }
    if (user.setupComplete !== undefined) return user.setupComplete
    try {
      const status = await onboardingService.getStatus()
      const requiredRoles = chosenRoles.length > 0 ? chosenRoles : status.requiredRoles || status.roles || []
      if (requiredRoles.length > 0) {
        return requiredRoles.every((role) => (
          role === 'admin' ||
          (role === 'organizer' && !!status.hasOrganizerProfile) ||
          (role === 'vendor' && !!status.hasVendorProfile)
        ))
      }
      return status.completed
    } catch {
      const local = localStorage.getItem('onboarding_complete')
      if (local !== null) return local === 'true'
      return !!(user.organizerProfile || user.vendorProfile)
    }
  }, [])

  const loadSession = useCallback(async () => {
    if (sessionChecked.current) return
    sessionChecked.current = true
    if (!getStoredSession()) {
      setState((s) => ({ ...s, loading: false }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const user = await authService.getMe()
      const profileComplete = await checkProfileComplete(user)
      cacheUser(user)
      const activeRole = getActiveRole(user)
      setState({ user, loading: false, error: null, profileComplete, activeRole })
    } catch {
      const cached = getCachedUser()
      const hasSession = getStoredSession()
      setState({ user: hasSession ? cached : null, loading: false, error: null, profileComplete: true, activeRole: getActiveRole(cached) })
    }
  }, [checkProfileComplete])

  useEffect(() => { loadSession() }, [loadSession])

  useEffect(() => {
    const syncSession = () => {
      const cached = getCachedUser()
      if (cached) {
        const chosenRoles = getChosenRoles()
        const profileComplete = chosenRoles.length > 0 ? chosenRoles.every((role) => hasSetupForRole(cached, role)) : cached.setupComplete ?? true
        setState({ user: cached, loading: false, error: null, profileComplete, activeRole: getActiveRole(cached) })
      }
    }
    window.addEventListener(AUTH_SESSION_EVENT, syncSession)
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession)
    }
  }, [])

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

  const register = useCallback(async (email: string, password: string, role: string | undefined, displayName: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      clearSetupCache()
      localStorage.removeItem(CHOSEN_ROLES_KEY)
      localStorage.removeItem(ACTIVE_ROLE_KEY)
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
    clearSetupCache()
    localStorage.removeItem(CHOSEN_ROLES_KEY)
    localStorage.removeItem(ACTIVE_ROLE_KEY)
    sessionChecked.current = false
    cacheUser(null)
    setState({ user: null, loading: false, error: null, profileComplete: true, activeRole: null })
  }, [])

  const setProfileComplete = useCallback(() => {
    localStorage.setItem('onboarding_complete', 'true')
    setState((s) => ({ ...s, profileComplete: true }))
  }, [])

  const chooseRoles = useCallback(async (roles: UserRole[]) => {
    const setupRoles = roles.filter((role) => role !== 'admin')
    clearSetupCache()
    setChosenRoles(setupRoles.length > 0 ? setupRoles : roles)
    localStorage.setItem(ACTIVE_ROLE_KEY, roles[0])
    const profile = await authService.syncProfile({ role: roles[0] })
    cacheUser(profile)
    const profileComplete = await checkProfileComplete(profile)
    setState({ user: profile, loading: false, error: null, profileComplete, activeRole: getActiveRole(profile) })
    return profile
  }, [checkProfileComplete])

  const setActiveRole = useCallback((role: UserRole) => {
    const roles = getUserRoles(state.user)
    if (!roles.includes(role)) return
    localStorage.setItem(ACTIVE_ROLE_KEY, role)
    setState((s) => ({ ...s, activeRole: role }))
    window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
  }, [state.user])

  const authState = getAuthState(state.user, state.loading, state.profileComplete)

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    profileComplete: state.profileComplete,
    activeRole: state.activeRole,
    userRoles: getUserRoles(state.user),
    chosenRoles: getChosenRoles(),
    authState,
    login,
    register,
    logout,
    reload: loadSession,
    setProfileComplete,
    chooseRoles,
    setActiveRole
  }
}
