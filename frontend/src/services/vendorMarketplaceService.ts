import { api } from './apiClient'

export interface VendorMarketplaceItem {
  id: string
  businessName: string
  serviceCategory: string[]
  location: string
  serviceArea: string
  startingPrice: number
  rating: number
  availabilityStatus: string
  packageHighlights: string[]
  packageTiers: Array<{
    name: string
    price: number
    description: string
  }>
  verified: boolean
  description: string
  services: Array<{
    id: string
    category: string
    serviceName: string
    description: string
    basePrice: number
    availabilityStatus: string
  }>
  memberSince: string
}

export interface VendorMarketplaceFilters {
  service?: string[]
  location?: string
  budgetMin?: number
  budgetMax?: number
  availability?: string[]
  ratingMin?: number
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
    if (filters?.ratingMin !== undefined) params.set('ratingMin', String(filters.ratingMin))
    const qs = params.toString()
    return api.get<VendorMarketplaceItem[]>(`/vendor-marketplace${qs ? `?${qs}` : ''}`)
  },

  async getAvailability(vendorId: string, year: number, month: number): Promise<VendorAvailability> {
    return api.get<VendorAvailability>(`/vendor-marketplace/${vendorId}/availability?year=${year}&month=${month}`)
  },

  async getMatched(briefId: string): Promise<VendorMarketplaceItem[]> {
    return api.get<VendorMarketplaceItem[]>(`/vendor-marketplace/matched/${briefId}`)
  },
}
