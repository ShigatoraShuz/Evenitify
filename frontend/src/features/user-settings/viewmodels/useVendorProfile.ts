import { useState, useCallback, useEffect } from 'react'
import { profileService } from '../../../services/profileService'
import type { VendorProfileForm } from '../models/user-settings.model'
import { DEFAULT_VENDOR_PROFILE } from '../models/user-settings.model'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'

interface VendorProfileState {
  profile: VendorProfileForm
  originalProfile: VendorProfileForm
  loading: boolean
  submitting: boolean
  error: string | null
  saved: boolean
}

export function useVendorProfile() {
  const [state, setState] = useState<VendorProfileState>({
    profile: DEFAULT_VENDOR_PROFILE,
    originalProfile: DEFAULT_VENDOR_PROFILE,
    loading: false,
    submitting: false,
    error: null,
    saved: false
  })

  const loadProfile = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await profileService.getVendorProfile()
      const profile: VendorProfileForm = {
        businessName: data.businessName,
        serviceArea: data.serviceArea,
        businessDescription: data.businessDescription,
        phone: data.phone
      }
      setState((s) => ({ ...s, profile, originalProfile: { ...profile }, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const updateProfile = useCallback((next: Partial<VendorProfileForm>) => {
    setState((s) => ({ ...s, saved: false, profile: { ...s.profile, ...next } }))
  }, [])

  const saveProfile = useCallback(async () => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await profileService.updateVendorProfile(state.profile)
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
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.submitting,
      error: state.error,
      loaded: !state.loading
    }),
    updateProfile,
    saveProfile,
    clearError
  }
}
