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
    budget?: number | null
    status?: string
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
  request_vendors?: {
    id?: string
    status?: string
    request_message?: string | null
    budget_min?: number | null
    budget_max?: number | null
    deadline?: string | null
    viewed_at?: string | null
    accepted_at?: string | null
    rejected_at?: string | null
    changes_requested_at?: string | null
    responded_at?: string | null
  } | Array<{
    id?: string
    status?: string
    request_message?: string | null
    budget_min?: number | null
    budget_max?: number | null
    deadline?: string | null
    viewed_at?: string | null
    accepted_at?: string | null
    rejected_at?: string | null
    changes_requested_at?: string | null
    responded_at?: string | null
  }> | null
  vendor_services?: Record<string, unknown> | null
  requestedServices?: Array<{
    id: string
    serviceName: string
    category: string | null
  }>
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
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/view`, {}),

  acceptVendorRequest: (bookingId: string) =>
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/accept`, {}),

  rejectVendorRequest: (bookingId: string) =>
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/reject`, {}),

  requestChangesVendorRequest: (bookingId: string, reason: string) =>
    api.patch<BookingRequest>(`/vendor/requests/${bookingId}/request-changes`, { reason }),

  submitQuote: (bookingId: string, payload: {
    price: number
    notes?: string | null
    validUntil?: string | null
  }) => api.post<BookingRequest>(`/vendor/bookings/${bookingId}/quote`, payload),
}
