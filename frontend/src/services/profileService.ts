import { api } from './apiClient'

export interface OrganizerProfile {
  id: string
  organizationName: string
  organizationType: string
  phone: string
  address: string
  website: string
  bio: string
  logoUrl: string
  createdAt: string
  updatedAt: string
}

export interface UpdateOrganizerProfilePayload {
  organizationName?: string
  organizationType?: string
  phone?: string
  address?: string
  website?: string
  bio?: string
  logoUrl?: string
}

export interface VendorProfile {
  id: string
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
  website: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface UpdateVendorProfilePayload {
  businessName?: string
  serviceArea?: string
  businessDescription?: string
  phone?: string
  website?: string
  address?: string
}

export interface AdminProfile {
  displayName: string
  email: string
}

export const profileService = {
  async getOrganizerProfile(): Promise<OrganizerProfile> {
    return api.get<OrganizerProfile>('/organizer/profile')
  },

  async updateOrganizerProfile(payload: UpdateOrganizerProfilePayload): Promise<OrganizerProfile> {
    return api.patch<OrganizerProfile>('/organizer/profile', payload)
  },

  async getVendorProfile(): Promise<VendorProfile> {
    return api.get<VendorProfile>('/vendor/profile')
  },

  async updateVendorProfile(payload: UpdateVendorProfilePayload): Promise<VendorProfile> {
    return api.patch<VendorProfile>('/vendor/profile', payload)
  },

  async getAdminSettings(): Promise<AdminProfile> {
    return api.get<AdminProfile>('/admin/settings')
  },

  async updateAdminSettings(payload: Partial<AdminProfile>): Promise<AdminProfile> {
    return api.patch<AdminProfile>('/admin/settings', payload)
  },
}
