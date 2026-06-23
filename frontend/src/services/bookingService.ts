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
    notes?: string | null
    requestedBudget?: number | null
  }) => api.post<BookingRequest>('/procurement-requests', payload),

  getBooking: (bookingId: string) =>
    api.get<BookingRequest>(`/procurement-requests/${bookingId}`),

  getEventBookings: (eventId: string) =>
    api.get<BookingRequest[]>(`/events/${eventId}/bookings`),

  listVendorB2BBookings: (status?: string) => {
    const qs = status ? `?status=${status}` : ''
    return api.get<BookingRequest[]>(`/vendor/bookings${qs}`)
  },

  getVendorBookingDetail: (bookingId: string) =>
    api.get<BookingRequest>(`/vendor/bookings/${bookingId}`),

  updateBookingStatus: (bookingId: string, payload: {
    status: 'accepted' | 'rejected' | 'changes_requested'
    reason?: string | null
  }) => api.patch<BookingRequest>(`/vendor/bookings/${bookingId}/status`, payload)
}
