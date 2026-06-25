export type EventTypeId =
  | 'wedding'
  | 'concert'
  | 'corporate'
  | 'conference'
  | 'product-launch'
  | 'festival'
  | 'birthday'
  | 'expo'
  | 'private'
  | 'custom'

export type SetupMode = 'indoor' | 'outdoor' | 'hybrid'

export interface EventBrief {
  eventId: string
  eventType: EventTypeId
  eventName: string
  location: string
  eventDate: string
  startTime: string
  endTime: string
  guestCount: number
  budget: number
  selectedTheme: string
  setupStyle: SetupMode
  selectedVendorServices: string[]
  indoorOutdoorType: SetupMode
  specialRequirements: string
  preferredPackageTier: 'basic' | 'premium' | 'luxury'
}

export type MatchLevel = 'recommended' | 'partial' | 'none'

export interface VendorMarketplaceVendor {
  id: string
  businessName: string
  serviceCategory: string[]
  location: string
  serviceArea: string
  startingPrice: number
  rating: number
  availabilityStatus: 'available' | 'limited' | 'unavailable'
  matchScore: number
  matchLevel: MatchLevel
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

export type TimeSlotType = 'morning' | 'afternoon' | 'evening' | 'full_day'

export interface TimeSlot {
  label: string
  value: TimeSlotType
  isOccupied: boolean
}

export interface AvailabilityDay {
  date: string
  status: 'available' | 'occupied' | 'partial' | 'booked'
  slots: TimeSlot[]
}

export interface VendorAvailability {
  vendorId: string
  year: number
  month: number
  days: AvailabilityDay[]
}

export interface BookingRequestData {
  eventBriefId?: string
  vendorId: string
  vendorName: string
  packageName?: string
  selectedDate: string
  selectedTimeSlot: TimeSlotType
  message: string
}

export interface EventBriefReference {
  id: string
  eventName: string
  eventType: string
  eventDate: string
}

export interface VendorFilterState {
  service: string[]
  location: string
  budgetMin: number | null
  budgetMax: number | null
  availability: string[]
  ratingMin: number | null
  matchLevel: MatchLevel | null
}

export const DEFAULT_VENDOR_FILTERS: VendorFilterState = {
  service: [],
  location: '',
  budgetMin: null,
  budgetMax: null,
  availability: [],
  ratingMin: null,
  matchLevel: null,
}

export type ProcurementStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'quoted'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'contract_pending'
  | 'confirmed'

export interface ProcurementRequest {
  id: string
  eventId: string
  vendorId: string
  vendorName: string
  serviceCategory: string
  status: ProcurementStatus
  requestedBudget: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface RequestFormData {
  vendorId: string
  vendorName: string
  serviceCategory: string
  requestedBudget: string
  notes: string
  selectedServiceIds: string[]
}

export interface CompareEntry {
  vendorId: string
  addedAt: string
}

export const SERVICE_OPTIONS = [
  'Catering',
  'Lights and sounds',
  'Event styling',
  'Venue decoration',
  'Photography',
  'Videography',
  'Entertainment',
  'Security',
  'Transportation',
  'Equipment rental',
  'Booth setup',
  'Stage production',
  'Event staff',
  'Cleanup crew',
]

