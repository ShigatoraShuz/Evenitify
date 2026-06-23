export interface OrganizerProfileForm {
  organizationName: string
  organizationType: string
  phone: string
  address: string
}

export const DEFAULT_ORGANIZER_PROFILE: OrganizerProfileForm = {
  organizationName: '',
  organizationType: '',
  phone: '',
  address: ''
}

export interface VendorProfileForm {
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
}

export const DEFAULT_VENDOR_PROFILE: VendorProfileForm = {
  businessName: '',
  serviceArea: '',
  businessDescription: '',
  phone: ''
}

export interface AdminSettingsForm {
  displayName: string
  email: string
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsForm = {
  displayName: '',
  email: ''
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
