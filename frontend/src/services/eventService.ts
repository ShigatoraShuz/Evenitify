import { api } from './apiClient'

export interface LargeEvent {
  id: string
  organizer_id: string
  title: string
  event_date: string
  venue: string
  budget: number
  expected_guests: number
  status: string
  created_at: string
  updated_at: string
}

export interface EventPortfolio {
  event: LargeEvent
  requirements: EventRequirement[]
  bookings: BookingWithDetails[]
  requirementSummary: Record<string, number>
  bookingSummary: Record<string, number>
}

export interface EventRequirement {
  id: string
  event_id: string
  category: string
  quantity: number
  min_budget: number | null
  max_budget: number | null
  requirement_status: string
  notes: string | null
  created_at: string
}

export interface BookingWithDetails {
  id: string
  event_id: string
  requirement_id: string
  vendor_id: string
  organizer_id: string
  status: string
  booking_type: string | null
  requested_budget: number | null
  notes: string | null
  requested_at: string
  vendor_profiles: { business_name: string; rating: number }
  event_requirements: { category: string; quantity: number }
  contracts: Contract[]
  statusHistory: StatusHistory[]
}

export interface Contract {
  id: string
  booking_id: string
  contract_status: string
  sent_at: string | null
  signed_at: string | null
}

export interface StatusHistory {
  id: string
  booking_id: string
  previous_status: string | null
  new_status: string
  reason: string | null
  created_at: string
}

export interface DashboardSummary {
  eventStatusSummary: {
    total: number
    draft: number
    planning: number
    booking: number
    confirmed: number
    completed: number
    cancelled: number
  }
  requirementSummary: {
    total: number
    open: number
    pendingBooking: number
    fulfilled: number
    cancelled: number
  }
  bookingSummary: {
    total: number
    pending: number
    accepted: number
    rejected: number
    changesRequested: number
    contractSent: number
    confirmed: number
    completed: number
    cancelled: number
  }
  upcomingEvents: Array<{ id: string; title: string; eventDate: string; status: string }>
  recentActivity: Array<{
    id: string
    booking_id: string
    previous_status: string | null
    new_status: string
    reason: string | null
    created_at: string
  }>
}

export const eventService = {
  listEvents: () => api.get<LargeEvent[]>('/events'),

  getEvent: (eventId: string) => api.get<LargeEvent>(`/events/${eventId}`),

  getEventPortfolio: (eventId: string) =>
    api.get<EventPortfolio>(`/events/${eventId}/portfolio`),

  getDashboardSummary: () =>
    api.get<DashboardSummary>('/events/dashboard/summary'),

  createEvent: (payload: {
    title: string
    eventDate: string
    venue: string
    budget: number
    expectedGuests: number
    status?: string
  }) => api.post<LargeEvent>('/events', payload),

  updateEvent: (eventId: string, payload: Partial<LargeEvent>) =>
    api.patch<LargeEvent>(`/events/${eventId}`, payload),

  deleteEvent: (eventId: string) =>
    api.delete<{ deleted: boolean; id: string }>(`/events/${eventId}`)
}
