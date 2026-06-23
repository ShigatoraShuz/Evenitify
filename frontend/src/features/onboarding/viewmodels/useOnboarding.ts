import { useState, useCallback, useRef } from 'react'
import { onboardingService } from '../../../services/onboardingService'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'
import type { OrganizerOnboardingForm, VendorOnboardingForm } from '../models/onboarding.model'
import { DEFAULT_ORGANIZER_ONBOARDING, DEFAULT_VENDOR_ONBOARDING } from '../models/onboarding.model'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'

interface OnboardingState {
  organizerForm: OrganizerOnboardingForm
  vendorForm: VendorOnboardingForm
  submitting: boolean
  error: string | null
}

export function useOnboarding() {
  const { user, setProfileComplete } = useAuthSession()
  const submittingRef = useRef(false)
  const [state, setState] = useState<OnboardingState>({
    organizerForm: DEFAULT_ORGANIZER_ONBOARDING,
    vendorForm: DEFAULT_VENDOR_ONBOARDING,
    submitting: false,
    error: null
  })

  const updateOrganizerForm = useCallback((next: Partial<OrganizerOnboardingForm>) => {
    setState((s) => ({ ...s, organizerForm: { ...s.organizerForm, ...next } }))
  }, [])

  const updateVendorForm = useCallback((next: Partial<VendorOnboardingForm>) => {
    setState((s) => ({ ...s, vendorForm: { ...s.vendorForm, ...next } }))
  }, [])

  const submitOnboarding = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      if (user?.role === 'organizer') {
        await onboardingService.completeOrganizerProfile(state.organizerForm)
      } else if (user?.role === 'vendor') {
        await onboardingService.completeVendorProfile(state.vendorForm)
      }
      setProfileComplete()
      setState((s) => ({ ...s, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [user, state.organizerForm, state.vendorForm, setProfileComplete])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    role: user?.role || null,
    organizerForm: state.organizerForm,
    vendorForm: state.vendorForm,
    submitting: state.submitting,
    error: state.error,
    ...buildViewModelStateMeta({
      submitting: state.submitting,
      error: state.error,
      loaded: true
    }),
    updateOrganizerForm,
    updateVendorForm,
    submitOnboarding,
    clearError
  }
}
