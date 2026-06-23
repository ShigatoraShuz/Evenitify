// MOCK DATA FILE - All mock data for frontend development without backend
// This file will be replaced by real API responses when backend is connected.

import type { LargeEvent, EventRequirement, BookingWithDetails, DashboardSummary, EventPortfolio } from '../eventService'
import type { VendorSearchResult, VendorService } from '../vendorService'
import type { BookingRequest } from '../bookingService'
import type { ContractDetail } from '../contractService'
import type { AppNotification } from '../../features/notifications/models/notifications.model'
import type { AdminDashboardSummary, AdminUser, AdminEvent, AdminBooking, AdminVendor } from '../../features/admin-operations/models/admin-operations.model'

const NOW = new Date().toISOString()
const LATER = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

export const MOCK_EVENTS: LargeEvent[] = [
  { id: 'evt-001', organizer_id: 'org-001', title: 'Annual Tech Summit 2026', event_date: LATER, venue: 'Manila Convention Center', budget: 500000, expected_guests: 2000, status: 'planning', created_at: NOW, updated_at: NOW },
  { id: 'evt-002', organizer_id: 'org-001', title: 'Corporate Year-End Gala', event_date: LATER, venue: 'Shangri-La Hotel', budget: 350000, expected_guests: 500, status: 'draft', created_at: NOW, updated_at: NOW },
  { id: 'evt-003', organizer_id: 'org-001', title: 'Product Launch Event', event_date: LATER, venue: 'SMX Convention Center', budget: 200000, expected_guests: 800, status: 'booking', created_at: NOW, updated_at: NOW },
]

export const MOCK_REQUIREMENTS: EventRequirement[] = [
  { id: 'req-001', event_id: 'evt-001', category: 'Catering', quantity: 2000, min_budget: 100000, max_budget: 200000, requirement_status: 'open', notes: 'Full course dinner', created_at: NOW },
  { id: 'req-002', event_id: 'evt-001', category: 'Lights and Sounds', quantity: 1, min_budget: 50000, max_budget: 150000, requirement_status: 'open', notes: 'Stage setup with LED wall', created_at: NOW },
  { id: 'req-003', event_id: 'evt-001', category: 'Venue', quantity: 1, min_budget: 150000, max_budget: 300000, requirement_status: 'fulfilled', notes: 'Main hall + 3 breakout rooms', created_at: NOW },
  { id: 'req-004', event_id: 'evt-002', category: 'Catering', quantity: 500, min_budget: 50000, max_budget: 100000, requirement_status: 'open', notes: 'Buffet style', created_at: NOW },
  { id: 'req-005', event_id: 'evt-002', category: 'Photo/Video', quantity: 1, min_budget: 20000, max_budget: 50000, requirement_status: 'open', notes: 'Full event coverage', created_at: NOW },
]

export const MOCK_VENDOR_SERVICES: VendorService[] = [
  { id: 'svc-001', vendor_id: 'ven-001', category: 'Catering', service_name: 'Premium Buffet Package', description: 'Full course buffet for large events', base_price: 150000, availability_status: 'available' },
  { id: 'svc-002', vendor_id: 'ven-001', category: 'Catering', service_name: 'Executive Plated Dinner', description: 'Fine dining experience', base_price: 250000, availability_status: 'limited' },
  { id: 'svc-003', vendor_id: 'ven-002', category: 'Lights and Sounds', service_name: 'Complete AV Package', description: 'Professional sound and lighting', base_price: 120000, availability_status: 'available' },
  { id: 'svc-004', vendor_id: 'ven-003', category: 'Venue', service_name: 'Grand Ballroom', description: 'Luxury venue for 1000+ guests', base_price: 250000, availability_status: 'available' },
  { id: 'svc-005', vendor_id: 'ven-004', category: 'Photo/Video', service_name: 'Event Photography Package', description: '3 photographers + edited photos', base_price: 45000, availability_status: 'available' },
  { id: 'svc-006', vendor_id: 'ven-005', category: 'Staff', service_name: 'Event Staff Package', description: 'Waitstaff, coordinators, security', base_price: 80000, availability_status: 'available' },
  { id: 'svc-007', vendor_id: 'ven-006', category: 'Transport', service_name: 'VIP Transport Fleet', description: 'Luxury vehicle fleet', base_price: 95000, availability_status: 'available' },
]

export const MOCK_VENDORS: VendorSearchResult[] = [
  { id: 'ven-001', business_name: 'Elite Catering Co.', contact_number: '+63 912 345 6789', service_area: 'Metro Manila', rating: 4.8, verification_status: 'verified', services: [MOCK_VENDOR_SERVICES[0], MOCK_VENDOR_SERVICES[1]] },
  { id: 'ven-002', business_name: 'SoundWave Productions', contact_number: '+63 923 456 7890', service_area: 'Metro Manila', rating: 4.6, verification_status: 'verified', services: [MOCK_VENDOR_SERVICES[2]] },
  { id: 'ven-003', business_name: 'Grand Venues Inc.', contact_number: '+63 934 567 8901', service_area: 'Nationwide', rating: 4.9, verification_status: 'verified', services: [MOCK_VENDOR_SERVICES[3]] },
  { id: 'ven-004', business_name: 'Capture Moments Studio', contact_number: '+63 945 678 9012', service_area: 'Metro Manila', rating: 4.5, verification_status: 'verified', services: [MOCK_VENDOR_SERVICES[4]] },
  { id: 'ven-005', business_name: 'ProStaff Solutions', contact_number: '+63 956 789 0123', service_area: 'Luzon', rating: 4.3, verification_status: 'pending', services: [MOCK_VENDOR_SERVICES[5]] },
  { id: 'ven-006', business_name: 'Luxury Rides PH', contact_number: '+63 967 890 1234', service_area: 'Metro Manila', rating: 4.7, verification_status: 'verified', services: [MOCK_VENDOR_SERVICES[6]] },
]

export const MOCK_BOOKINGS: BookingRequest[] = [
  { id: 'bok-001', event_id: 'evt-001', requirement_id: 'req-003', vendor_id: 'ven-003', organizer_id: 'org-001', booking_type: 'B2B', status: 'confirmed', requested_budget: 280000, notes: 'Confirmed for main hall', requested_at: NOW, updated_at: NOW, large_events: { title: 'Annual Tech Summit 2026', event_date: LATER, venue: 'Manila Convention Center', expected_guests: 2000 }, event_requirements: { category: 'Venue', quantity: 1 }, vendor_profiles: { business_name: 'Grand Venues Inc.', rating: 4.9, verification_status: 'verified' }, organizer_profiles: { organization_name: 'TechCorp Events' } },
  { id: 'bok-002', event_id: 'evt-001', requirement_id: 'req-001', vendor_id: 'ven-001', organizer_id: 'org-001', booking_type: 'B2B', status: 'pending', requested_budget: 180000, notes: 'Need quote for 2000 pax', requested_at: NOW, updated_at: NOW, large_events: { title: 'Annual Tech Summit 2026', event_date: LATER, venue: 'Manila Convention Center', expected_guests: 2000 }, event_requirements: { category: 'Catering', quantity: 2000 }, vendor_profiles: { business_name: 'Elite Catering Co.', rating: 4.8, verification_status: 'verified' }, organizer_profiles: { organization_name: 'TechCorp Events' } },
  { id: 'bok-003', event_id: 'evt-003', requirement_id: 'req-001', vendor_id: 'ven-002', organizer_id: 'org-001', booking_type: 'B2B', status: 'accepted', requested_budget: 100000, notes: null, requested_at: NOW, updated_at: NOW, large_events: { title: 'Product Launch Event', event_date: LATER, venue: 'SMX Convention Center', expected_guests: 800 }, event_requirements: { category: 'Lights and Sounds', quantity: 1 }, vendor_profiles: { business_name: 'SoundWave Productions', rating: 4.6, verification_status: 'verified' }, organizer_profiles: { organization_name: 'TechCorp Events' } },
]

export const MOCK_CONTRACTS: ContractDetail[] = [
  { id: 'con-001', booking_id: 'bok-001', contract_number: 'CT-2026-001', contract_url: null, storage_path: null, contract_status: 'active', terms_summary: 'Venue rental for Annual Tech Summit 2026. Payment schedule: 50% upon signing, 50% 7 days before event.', sent_at: NOW, organizer_signed_at: NOW, vendor_signed_at: NOW, signed_at: NOW, final_status: null, created_at: NOW, updated_at: NOW },
  { id: 'con-002', booking_id: 'bok-003', contract_number: null, contract_url: null, storage_path: null, contract_status: 'organizer_signed', terms_summary: 'AV equipment and sound system for Product Launch Event.', sent_at: NOW, organizer_signed_at: NOW, vendor_signed_at: null, signed_at: null, final_status: null, created_at: NOW, updated_at: NOW },
]

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'not-001', user_id: 'usr-001', booking_id: 'bok-001', title: 'Booking Confirmed', message: 'Grand Venues Inc. confirmed your venue booking for Annual Tech Summit 2026.', is_read: false, notification_type: 'booking_update', priority: 'high', action_url: '/organizer/portfolio?eventId=evt-001', metadata: {}, read_at: null, created_at: NOW },
  { id: 'not-002', user_id: 'usr-001', booking_id: 'bok-002', title: 'Vendor Response', message: 'Elite Catering Co. is reviewing your catering request.', is_read: false, notification_type: 'vendor_response', priority: 'normal', action_url: '/organizer/portfolio?eventId=evt-001', metadata: {}, read_at: null, created_at: NOW },
  { id: 'not-003', user_id: 'usr-001', booking_id: 'bok-003', title: 'Contract Signed', message: 'You signed the contract with SoundWave Productions.', is_read: true, notification_type: 'contract_update', priority: 'normal', action_url: '/organizer/portfolio?eventId=evt-003', metadata: {}, read_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'not-004', user_id: 'usr-001', booking_id: null, title: 'Welcome to Eventify', message: 'Start by creating your first large event.', is_read: true, notification_type: 'system', priority: 'normal', action_url: '/organizer', metadata: {}, read_at: new Date(Date.now() - 3 * 86400000).toISOString(), created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
]

export const MOCK_ADMIN_SUMMARY: AdminDashboardSummary = {
  total_organizers: 12,
  total_vendors: 24,
  total_events: 45,
  large_events_500plus: 18,
  pending_bookings: 7,
  accepted_bookings: 5,
  completed_bookings: 12,
  confirmed_bookings: 8,
  rejected_bookings: 3,
  cancelled_bookings: 2,
  pending_verifications: 4,
  draft_contracts: 3,
  active_contracts: 6,
}

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 'usr-001', email: 'organizer@eventify.com', role: 'organizer', display_name: 'TechCorp Events', created_at: NOW },
  { id: 'usr-002', email: 'vendor@eventify.com', role: 'vendor', display_name: 'Elite Catering Co.', created_at: NOW },
  { id: 'usr-003', email: 'admin@eventify.com', role: 'admin', display_name: 'System Admin', created_at: NOW },
  { id: 'usr-004', email: 'vendor2@eventify.com', role: 'vendor', display_name: 'SoundWave Productions', created_at: NOW },
]

export const MOCK_ADMIN_EVENTS: AdminEvent[] = MOCK_EVENTS.map((e) => ({
  ...e,
  organization_name: 'TechCorp Events',
}))

export const MOCK_ADMIN_BOOKINGS: AdminBooking[] = MOCK_BOOKINGS.map((b) => ({
  id: b.id,
  status: b.status,
  booking_type: b.booking_type,
  requested_budget: b.requested_budget,
  notes: b.notes,
  requested_at: b.requested_at,
  large_events: b.large_events!,
  organizer_profiles: b.organizer_profiles!,
  vendor_profiles: b.vendor_profiles!,
  event_requirements: b.event_requirements!,
}))

export const MOCK_ADMIN_VENDORS: AdminVendor[] = MOCK_VENDORS.map((v) => ({
  id: v.id,
  business_name: v.business_name,
  contact_number: v.contact_number,
  service_area: v.service_area,
  rating: v.rating,
  verification_status: v.verification_status as AdminVendor['verification_status'],
  created_at: NOW,
}))

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  eventStatusSummary: { total: 3, draft: 1, planning: 1, booking: 1, confirmed: 0, completed: 0, cancelled: 0 },
  requirementSummary: { total: 5, open: 3, pendingBooking: 0, fulfilled: 1, cancelled: 0 },
  bookingSummary: { total: 3, pending: 1, accepted: 1, rejected: 0, changesRequested: 0, contractSent: 0, confirmed: 1, completed: 0, cancelled: 0 },
  upcomingEvents: MOCK_EVENTS.map((e) => ({ id: e.id, title: e.title, eventDate: e.event_date, status: e.status })),
  recentActivity: [],
}

export function buildMockPortfolio(eventId: string): EventPortfolio {
  const event = MOCK_EVENTS.find((e) => e.id === eventId)!
  const requirements = MOCK_REQUIREMENTS.filter((r) => r.event_id === eventId)
  const bookings = MOCK_BOOKINGS.filter((b) => b.event_id === eventId).map((b) => {
    const contract = MOCK_CONTRACTS.find((c) => c.booking_id === b.id)
    return {
      id: b.id,
      event_id: b.event_id,
      requirement_id: b.requirement_id,
      vendor_id: b.vendor_id,
      organizer_id: b.organizer_id,
      status: b.status,
      requested_budget: b.requested_budget,
      notes: b.notes,
      requested_at: b.requested_at,
      vendor_profiles: b.vendor_profiles!,
      event_requirements: b.event_requirements!,
      contracts: contract ? [contract] : [],
      statusHistory: [],
    } as BookingWithDetails
  })
  return {
    event,
    requirements,
    bookings,
    requirementSummary: { total: requirements.length, open: requirements.filter((r) => r.requirement_status === 'open').length, fulfilled: requirements.filter((r) => r.requirement_status === 'fulfilled').length },
    bookingSummary: { total: bookings.length, pending: bookings.filter((b) => b.status === 'pending').length, accepted: bookings.filter((b) => b.status === 'accepted').length, confirmed: bookings.filter((b) => b.status === 'confirmed').length, completed: bookings.filter((b) => b.status === 'completed').length, cancelled: bookings.filter((b) => b.status === 'cancelled').length },
  }
}
