import { api } from './apiClient'

export interface BookingRequest {
  id: string
  event_id: string
  requirement_id: string
  vendor_id: string
  organizer_id: string
  booking_type: string
  status: string
  requested_budget: number | null
  notes: string | null
  requested_at: string
  updated_at: string
  large_events?: {
    title: string
    event_date: string
    venue: string
    expected_guests: number
  }
  event_requirements?: {
    category: string
    quantity: number
    min_budget?: number | null
    max_budget?: number | null
    notes?: string | null
    requirement_status?: string
  }
  vendor_profiles?: {
    business_name: string
    rating: number
    verification_status: string
  }
  organizer_profiles?: {
    organization_name: string
  }
}

export const bookingService = {
  createBookingRequest: (payload: {
    eventId: string
    requirementId: string
    vendorId: string
    bookingType?: string
    responseDeadline?: string | null
    notes?: string | null
    requestedBudget?: number | null
  }) => api.post<BookingRequest>('/procurement-requests', payload),

  getBooking: (bookingId: string) =>
    api.get<BookingRequest>(`/procurement-requests/${bookingId}`),

  getEventBookings: (eventId: string) =>
    api.get<BookingRequest[]>(`/events/${eventId}/bookings`),

  listVendorB2BBookings: (status?: string, type?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    const qs = params.toString()
    return api.get<BookingRequest[]>(`/vendor/bookings${qs ? `?${qs}` : ''}`)
  },

  getVendorBookingDetail: (bookingId: string) =>
    api.get<BookingRequest>(`/vendor/bookings/${bookingId}`),

  viewVendorRequest: (bookingId: string) =>
    api.patch(`/vendor/requests/${bookingId}/view`, {}),

  acceptVendorRequest: (bookingId: string) =>
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/accept`, {}),

  rejectVendorRequest: (bookingId: string) =>
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/reject`, {}),

  requestChangesVendorRequest: (bookingId: string, reason: string) =>
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/request-changes`, { reason }),

  updateBookingStatus: (bookingId: string, payload: {
    status: 'accepted' | 'rejected' | 'changes_requested'
    reason?: string | null
  }) => api.patch<BookingRequest>(`/vendor/bookings/${bookingId}/status`, payload),

  submitQuote: (bookingId: string, payload: {
    price: number
    notes?: string | null
    validUntil?: string | null
  }) => api.post(`/vendor/bookings/${bookingId}/quote`, payload),

  awardVendor: (bookingId: string, payload: {
    quoteId: string
  }) => api.post(`/procurement-requests/${bookingId}/award`, payload)
}
