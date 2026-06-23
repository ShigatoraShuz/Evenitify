import { api } from './apiClient'

export interface OrganizerProfileData {
  organizationName: string
  organizationType: string
  phone: string
  address: string
}

export interface VendorProfileData {
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
}

export interface AdminSettingsData {
  displayName: string
  email: string
}

export const profileService = {
  getOrganizerProfile: () =>
    api.get<OrganizerProfileData>('/profile/organizer'),

  updateOrganizerProfile: (data: Partial<OrganizerProfileData>) =>
    api.patch<OrganizerProfileData>('/profile/organizer', data),

  getVendorProfile: () =>
    api.get<VendorProfileData>('/profile/vendor'),

  updateVendorProfile: (data: Partial<VendorProfileData>) =>
    api.patch<VendorProfileData>('/profile/vendor', data),

  getAdminSettings: () =>
    api.get<AdminSettingsData>('/profile/admin'),

  updateAdminSettings: (data: Partial<AdminSettingsData>) =>
    api.patch<AdminSettingsData>('/profile/admin', data)
}
