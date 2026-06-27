export type VendorB2BBookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'changes_requested'
  | 'contract_sent'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface VendorB2BBooking {
  id: string
  eventId: string
  requirementId: string
  vendorId: string
  organizerId: string
  status: VendorB2BBookingStatus
  requestedBudget: number | null
  notes: string | null
  requestedAt: string
  eventTitle: string
  eventDate: string
  venue: string
  expectedGuests: number
  requirementCategory: string
  requirementQuantity: number
  organizerName: string
}

export interface VendorB2BDashboardState {
  bookings: VendorB2BBooking[]
  selectedBooking: VendorB2BBooking | null
  activeTab: VendorB2BBookingStatus | 'all'
  loading: boolean
  error: string | null
}

export const B2B_TABS: { key: VendorB2BBookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Requests' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'changes_requested', label: 'Negotiating' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' }
]

export type RequestType = 'all' | 'large_event' | 'personal'

export const REQUEST_SIZE_GUEST_LIMIT = 20

export const REQUEST_TYPE_TABS: { key: RequestType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'large_event', label: 'Large Event' },
  { key: 'personal', label: 'Micro Events' }
]

export function getRequestTypeFromGuests(expectedGuests?: number | string | null): RequestType | null {
  if (expectedGuests == null || expectedGuests === '') return null

  const guestCount = Number(expectedGuests)
  if (!Number.isFinite(guestCount) || guestCount <= 0) return null

  return guestCount > REQUEST_SIZE_GUEST_LIMIT ? 'large_event' : 'personal'
}

export function getRequestTypeLabel(expectedGuests?: number | string | null) {
  const requestType = getRequestTypeFromGuests(expectedGuests)
  if (requestType === 'large_event') return 'Large Event'
  if (requestType === 'personal') return 'Micro Event'
  return 'Guest count unavailable'
}
