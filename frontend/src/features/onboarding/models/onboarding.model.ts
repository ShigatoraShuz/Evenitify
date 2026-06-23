export interface OrganizerOnboardingForm {
  organizationName: string
  organizationType: string
  phone: string
  address: string
}

export const DEFAULT_ORGANIZER_ONBOARDING: OrganizerOnboardingForm = {
  organizationName: '',
  organizationType: '',
  phone: '',
  address: ''
}

export interface VendorOnboardingForm {
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
}

export const DEFAULT_VENDOR_ONBOARDING: VendorOnboardingForm = {
  businessName: '',
  serviceArea: '',
  businessDescription: '',
  phone: ''
}

export const ORGANIZATION_TYPES = [
  'Corporate',
  'Non-Profit',
  'Educational',
  'Government',
  'Individual',
  'Other'
]

export const SERVICE_AREAS = [
  'Catering',
  'Lights and Sounds',
  'Venue',
  'Photo/Video',
  'Staff',
  'Transport'
]
