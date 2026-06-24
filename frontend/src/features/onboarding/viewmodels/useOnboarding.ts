import { useState, useCallback, useRef } from 'react'
import { onboardingService } from '../../../services/onboardingService'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'
import type { UserRole } from '../../../services/authService'
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
  const { user, chosenRoles, setProfileComplete, reload } = useAuthSession()
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

  const setupRoles = chosenRoles.length > 0 ? chosenRoles : user?.roles?.filter((role) => role !== 'admin') || []
  const currentSetupRole = setupRoles.find((role) => (
    role === 'organizer' ? !(user?.hasOrganizerProfile ?? user?.organizerProfile) :
    role === 'vendor' ? !(user?.hasVendorProfile ?? user?.vendorProfile) :
    false
  )) || user?.role || null

  const submitOnboarding = useCallback(async () => {
    if (submittingRef.current) return false
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      if (currentSetupRole === 'organizer') {
        await onboardingService.completeOrganizerProfile(state.organizerForm)
      } else if (currentSetupRole === 'vendor') {
        await onboardingService.completeVendorProfile(state.vendorForm)
      }
      const completedRoles = setupRoles.length > 0 ? setupRoles : currentSetupRole ? [currentSetupRole] : []
      const allComplete = completedRoles.every((role) => {
        if (role === currentSetupRole) return true
        if (role === 'organizer') return !!(user?.hasOrganizerProfile ?? user?.organizerProfile)
        if (role === 'vendor') return !!(user?.hasVendorProfile ?? user?.vendorProfile)
        return role === 'admin'
      })
      await reload()
      if (allComplete) setProfileComplete()
      setState((s) => ({ ...s, submitting: false }))
      return allComplete
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
      return false
    } finally {
      submittingRef.current = false
    }
  }, [currentSetupRole, setupRoles, user, state.organizerForm, state.vendorForm, reload, setProfileComplete])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    role: currentSetupRole as UserRole | null,
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
