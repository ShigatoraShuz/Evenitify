export interface AdminDashboardSummary {
  total_organizers: number
  total_vendors: number
  total_events: number
  large_events_500plus: number
  pending_bookings: number
  accepted_bookings: number
  completed_bookings: number
  confirmed_bookings: number
  rejected_bookings: number
  cancelled_bookings: number
  pending_verifications: number
  draft_contracts: number
  active_contracts: number
}

export interface AdminUser {
  id: string
  email: string
  role: 'organizer' | 'vendor' | 'admin'
  display_name: string | null
  created_at: string
}

export interface AdminEvent {
  id: string
  title: string
  event_date: string
  venue: string
  budget: number
  expected_guests: number
  status: string
  organization_name: string
  created_at: string
}

export interface AdminBooking {
  id: string
  status: string
  booking_type: string
  requested_budget: number | null
  notes: string | null
  requested_at: string
  large_events: { title: string; event_date: string; venue: string }
  organizer_profiles: { organization_name: string }
  vendor_profiles: { business_name: string }
  event_requirements: { category: string }
}

export interface AdminVendor {
  id: string
  business_name: string
  contact_number: string | null
  service_area: string | null
  rating: number
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

export const DEFAULT_DASHBOARD_SUMMARY: AdminDashboardSummary = {
  total_organizers: 0,
  total_vendors: 0,
  total_events: 0,
  large_events_500plus: 0,
  pending_bookings: 0,
  accepted_bookings: 0,
  completed_bookings: 0,
  confirmed_bookings: 0,
  rejected_bookings: 0,
  cancelled_bookings: 0,
  pending_verifications: 0,
  draft_contracts: 0,
  active_contracts: 0
}
