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
  role: 'organizer' | 'vendor' | 'admin'
}

export const onboardingService = {
  getStatus: () =>
    api.get<OnboardingStatus>('/onboarding/status'),

  completeOrganizerProfile: (data: OrganizerOnboardingData) =>
    api.post<void>('/onboarding/organizer', data),

  completeVendorProfile: (data: VendorOnboardingData) =>
    api.post<void>('/onboarding/vendor', data)
}
