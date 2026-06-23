import { useState, useCallback, useEffect } from 'react'
import { profileService } from '../../../services/profileService'
import type { OrganizerProfileForm } from '../models/user-settings.model'
import { DEFAULT_ORGANIZER_PROFILE } from '../models/user-settings.model'

interface OrganizerProfileState {
  profile: OrganizerProfileForm
  originalProfile: OrganizerProfileForm
  loading: boolean
  submitting: boolean
  error: string | null
  saved: boolean
}

export function useOrganizerProfile() {
  const [state, setState] = useState<OrganizerProfileState>({
    profile: DEFAULT_ORGANIZER_PROFILE,
    originalProfile: DEFAULT_ORGANIZER_PROFILE,
    loading: false,
    submitting: false,
    error: null,
    saved: false
  })

  const loadProfile = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await profileService.getOrganizerProfile()
      const profile: OrganizerProfileForm = {
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        phone: data.phone,
        address: data.address
      }
      setState((s) => ({ ...s, profile, originalProfile: { ...profile }, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const updateProfile = useCallback((next: Partial<OrganizerProfileForm>) => {
    setState((s) => ({ ...s, saved: false, profile: { ...s.profile, ...next } }))
  }, [])

  const saveProfile = useCallback(async () => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await profileService.updateOrganizerProfile(state.profile)
      setState((s) => ({ ...s, submitting: false, originalProfile: { ...s.profile }, saved: true }))
      setTimeout(() => setState((s) => ({ ...s, saved: false })), 3000)
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.profile])

  const hasChanges = JSON.stringify(state.profile) !== JSON.stringify(state.originalProfile)

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    profile: state.profile,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,
    saved: state.saved,
    hasChanges,
    updateProfile,
    saveProfile,
    clearError
  }
}
