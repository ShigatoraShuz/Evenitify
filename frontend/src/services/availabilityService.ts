import { api } from './apiClient'

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable'

export interface AvailabilityDay {
  date: string
  status: AvailabilityStatus
  label: string
}

export interface BlockedDate {
  id: string
  date: string
  reason: string
}

export interface VendorAvailabilityPreview {
  vendorId: string
  status: AvailabilityStatus
  days: AvailabilityDay[]
  blockedDates: BlockedDate[]
  conflictDate: string | null
  conflictReason: string | null
  updatedAt: string
}

export const availabilityService = {
  getVendorAvailabilityPreview: async (vendorId: string, eventId?: string | null): Promise<VendorAvailabilityPreview> =>
    api.get<VendorAvailabilityPreview>(`/vendors/${vendorId}/availability${eventId ? `?eventId=${eventId}` : ''}`),

  getMyAvailability: async (): Promise<VendorAvailabilityPreview> =>
    api.get<VendorAvailabilityPreview>('/vendor/availability'),

  updateMyAvailabilityStatus: async (status: AvailabilityStatus): Promise<VendorAvailabilityPreview> =>
    api.patch<VendorAvailabilityPreview>('/vendor/availability/status', { status })
}

