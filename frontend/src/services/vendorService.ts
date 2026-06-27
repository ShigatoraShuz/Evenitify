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
  capacity: number | null
  service_address: string | null
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
    businessName?: string
    availability?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.set('category', filters.category)
    if (filters?.location) params.set('location', filters.location)
    if (filters?.minBudget !== undefined) params.set('minBudget', String(filters.minBudget))
    if (filters?.maxBudget !== undefined) params.set('maxBudget', String(filters.maxBudget))
    if (filters?.minRating !== undefined) params.set('minRating', String(filters.minRating))
    if (filters?.businessName) params.set('businessName', filters.businessName)
    if (filters?.availability) params.set('availability', filters.availability)
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder)
    const qs = params.toString()
    return api.get<VendorSearchResult[]>(`/vendors${qs ? `?${qs}` : ''}`)
  },

  getVendorProfile: (vendorId: string) =>
    api.get<VendorProfile>(`/vendors/${vendorId}`),

  // TODO: Consider moving requirement methods to eventService for better domain alignment
  listRequirements: (eventId: string) =>
    api.get<EventRequirement[]>(`/events/${eventId}/requirements`),

  createRequirement: (eventId: string, payload: {
    category: string
    quantity: number
    minBudget?: number | null
    maxBudget?: number | null
    notes?: string | null
  }) => api.post<EventRequirement>(`/events/${eventId}/requirements`, payload),

  deleteRequirement: (requirementId: string) =>
    api.delete<void>(`/requirements/${requirementId}`),

  listServices: () => api.get<VendorService[]>('/vendor/services'),

  createService: (payload: {
    category: string
    serviceName: string
    description?: string | null
    basePrice: number
    availabilityStatus?: string
    capacity?: number
    serviceAddress?: string
  }) => api.post<VendorService>('/vendor/services', payload),

  deleteService: (serviceId: string) =>
    api.delete<{ id: string; deleted: boolean }>(`/vendor/services/${serviceId}`),

  uploadServiceImage: (formData: FormData) =>
    api.postForm<{ imageUrl: string }>('/vendor/services/upload-image', formData)
}
