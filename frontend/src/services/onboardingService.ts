import { api } from './apiClient'

export interface OrganizerOnboardingData {
  organizationName: string
  organizationType: string
  phone: string
  address: string
}

export interface VendorOnboardingData {
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
}

export interface OnboardingStatus {
  completed: boolean
  role: 'organizer' | 'vendor' | 'admin' | null
  selectedRole?: 'organizer' | 'vendor' | 'admin' | null
  roles?: Array<'organizer' | 'vendor' | 'admin'>
  requiredRoles?: Array<'organizer' | 'vendor' | 'admin'>
  hasOrganizerProfile?: boolean
  hasVendorProfile?: boolean
}

export const onboardingService = {
  getStatus: () =>
    api.get<OnboardingStatus>('/onboarding/status'),

  completeOrganizerProfile: (data: OrganizerOnboardingData) =>
    api.post<void>('/onboarding/complete', { ...data, role: 'organizer' }),

  completeVendorProfile: (data: VendorOnboardingData) =>
    api.post<void>('/onboarding/complete', { ...data, role: 'vendor' }),
}
