import { api } from './apiClient'
import type { EventRequirement } from './eventService'

export interface VendorSearchResult {
  id: string
  business_name: string
  contact_number: string | null
  service_area: string | null
  rating: number
  verification_status: string
  services: VendorService[]
}

export interface VendorService {
  id: string
  vendor_id: string
  category: string
  service_name: string
  description: string | null
  base_price: number
  availability_status: string
}

export interface VendorProfile {
  id: string
  user_id: string
  business_name: string
  contact_number: string | null
  service_area: string | null
  rating: number
  verification_status: string
  services: VendorService[]
}

export const vendorService = {
  searchVendors: (filters?: {
    category?: string
    location?: string
    minBudget?: number
    maxBudget?: number
    minRating?: number
  }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.set('category', filters.category)
    if (filters?.location) params.set('location', filters.location)
    if (filters?.minBudget !== undefined) params.set('minBudget', String(filters.minBudget))
    if (filters?.maxBudget !== undefined) params.set('maxBudget', String(filters.maxBudget))
    if (filters?.minRating !== undefined) params.set('minRating', String(filters.minRating))
    const qs = params.toString()
    return api.get<VendorSearchResult[]>(`/vendors${qs ? `?${qs}` : ''}`)
  },

  getVendorProfile: (vendorId: string) =>
    api.get<VendorProfile>(`/vendors/${vendorId}`),

  listRequirements: (eventId: string) =>
    api.get<EventRequirement[]>(`/events/${eventId}/requirements`),

  createRequirement: (eventId: string, payload: {
    category: string
    quantity: number
    minBudget?: number | null
    maxBudget?: number | null
    notes?: string | null
  }) => api.post<EventRequirement>(`/events/${eventId}/requirements`, payload),

  updateRequirement: (requirementId: string, payload: Partial<EventRequirement>) =>
    api.patch<EventRequirement>(`/requirements/${requirementId}`, payload),

  deleteRequirement: (requirementId: string) =>
    api.delete<void>(`/requirements/${requirementId}`),

  getProfile: () => api.get<VendorProfile>('/vendor/profile'),

  updateProfile: (payload: Partial<VendorProfile>) =>
    api.patch<VendorProfile>('/vendor/profile', payload),

  listServices: () => api.get<VendorService[]>('/vendor/services'),

  createService: (payload: {
    category: string
    serviceName: string
    description?: string | null
    basePrice: number
    availabilityStatus?: string
  }) => api.post<VendorService>('/vendor/services', payload),

  updateService: (serviceId: string, payload: Partial<VendorService>) =>
    api.patch<VendorService>(`/vendor/services/${serviceId}`, payload)
}
