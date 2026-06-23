export type RequirementCategory = 'Catering' | 'Lights and Sounds' | 'Venue' | 'Photo/Video' | 'Staff' | 'Transport'

export type RequirementStatus = 'open' | 'pending_booking' | 'fulfilled' | 'cancelled'

export interface EventRequirement {
  id: string
  eventId: string
  category: RequirementCategory
  quantity: number
  minBudget?: number
  maxBudget?: number
  requirementStatus: RequirementStatus
  notes?: string
}

export interface RequirementForm {
  category: RequirementCategory
  quantity: number
  minBudget: number | null
  maxBudget: number | null
  notes: string
}

export const DEFAULT_REQUIREMENT_FORM: RequirementForm = {
  category: 'Catering',
  quantity: 1,
  minBudget: null,
  maxBudget: null,
  notes: ''
}

export const REQUIREMENT_CATEGORIES: RequirementCategory[] = [
  'Catering',
  'Lights and Sounds',
  'Venue',
  'Photo/Video',
  'Staff',
  'Transport'
]

export interface VendorSearchResult {
  id: string
  businessName: string
  serviceArea: string | null
  rating: number
  verificationStatus: string
  services: VendorServiceItem[]
}

export interface VendorServiceItem {
  category: RequirementCategory
  serviceName: string
  basePrice: number
  availabilityStatus: string
}

export interface VendorFilterState {
  category: RequirementCategory | null
  location: string
  minBudget: number | null
  maxBudget: number | null
  minRating: number | null
}

export const DEFAULT_VENDOR_FILTERS: VendorFilterState = {
  category: null,
  location: '',
  minBudget: null,
  maxBudget: null,
  minRating: null
}

export type ProcurementStep = 'requirements' | 'vendors' | 'booking' | 'confirm'
