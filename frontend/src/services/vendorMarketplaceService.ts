import { api } from './apiClient'

export interface VendorMarketplaceItem {
  id: string
  businessName: string
  serviceCategory: string[]
  location: string
  serviceArea: string
  startingPrice: number
  rating: number
  completedBookings: number
  capacity: number
  availabilityStatus: string
  eventTypeExperience: string[]
  packageHighlights: string[]
  packageTiers: Array<{
    name: string
    price: number
    description: string
  }>
  verified: boolean
  responseTime: string
  responseRate: string
  description: string
  galleryImages: Array<{ url: string; label: string }>
  services: Array<{
    id: string
    category: string
    serviceName: string
    description: string
    basePrice: number
    availabilityStatus: string
  }>
  reviews: Array<{
    id: string
    authorName: string
    rating: number
    date: string
    text: string
    eventType: string
  }>
  inclusions: string[]
  addOns: string[]
  cancellationPolicy: string
  bookingNotes: string
  memberSince: string
  totalReviews: number
}

export interface VendorMarketplaceFilters {
  service?: string[]
  location?: string
  budgetMin?: number
  budgetMax?: number
  availability?: string[]
  capacityMin?: number
  ratingMin?: number
  eventTypeExperience?: string[]
}

export interface VendorAvailability {
  vendorId: string
  year: number
  month: number
  days: Array<{
    date: string
    status: 'available' | 'occupied' | 'partial' | 'booked'
    slots: Array<{
      label: string
      value: string
      isOccupied: boolean
    }>
  }>
}

export const vendorMarketplaceService = {
  async getAll(filters?: VendorMarketplaceFilters): Promise<VendorMarketplaceItem[]> {
    const params = new URLSearchParams()
    if (filters?.service?.length) params.set('service', filters.service.join(','))
    if (filters?.location) params.set('location', filters.location)
    if (filters?.budgetMin !== undefined) params.set('budgetMin', String(filters.budgetMin))
    if (filters?.budgetMax !== undefined) params.set('budgetMax', String(filters.budgetMax))
    if (filters?.availability?.length) params.set('availability', filters.availability.join(','))
    if (filters?.capacityMin !== undefined) params.set('capacityMin', String(filters.capacityMin))
    if (filters?.ratingMin !== undefined) params.set('ratingMin', String(filters.ratingMin))
    if (filters?.eventTypeExperience?.length) params.set('eventTypeExperience', filters.eventTypeExperience.join(','))
    const qs = params.toString()
    return api.get<VendorMarketplaceItem[]>(`/vendor-marketplace${qs ? `?${qs}` : ''}`)
  },

  async getById(id: string): Promise<VendorMarketplaceItem> {
    return api.get<VendorMarketplaceItem>(`/vendor-marketplace/${id}`)
  },

  async getAvailability(vendorId: string, year: number, month: number): Promise<VendorAvailability> {
    return api.get<VendorAvailability>(`/vendor-marketplace/${vendorId}/availability?year=${year}&month=${month}`)
  },

  async getMatched(briefId: string): Promise<VendorMarketplaceItem[]> {
    return api.get<VendorMarketplaceItem[]>(`/vendor-marketplace/matched/${briefId}`)
  },
}
