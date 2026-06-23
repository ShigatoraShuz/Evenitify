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
    api.get<OrganizerProfileData>('/organizer/profile'),

  updateOrganizerProfile: (data: Partial<OrganizerProfileData>) =>
    api.patch<OrganizerProfileData>('/organizer/profile', data),

  getVendorProfile: () =>
    api.get<VendorProfileData>('/vendor/profile'),

  updateVendorProfile: (data: Partial<VendorProfileData>) =>
    api.patch<VendorProfileData>('/vendor/profile', data),

  getAdminSettings: () =>
    api.get<AdminSettingsData>('/admin/settings'),

  updateAdminSettings: (data: Partial<AdminSettingsData>) =>
    api.patch<AdminSettingsData>('/admin/settings', data),
}
