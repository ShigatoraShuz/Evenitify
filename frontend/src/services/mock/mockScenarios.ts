// MOCK SCENARIO FILE - scenario-based frontend demo datasets only.
import {
  MOCK_ADMIN_BOOKINGS,
  MOCK_ADMIN_EVENTS,
  MOCK_ADMIN_SUMMARY,
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_VENDORS,
  MOCK_BOOKINGS,
  MOCK_CONTRACTS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_EVENTS,
  MOCK_NOTIFICATIONS,
  MOCK_REQUIREMENTS,
  MOCK_VENDOR_SERVICES,
  MOCK_VENDORS,
  buildMockPortfolio
} from './mockData'
import type { EventPortfolio, LargeEvent, EventRequirement, DashboardSummary } from '../eventService'
import type { BookingRequest } from '../bookingService'
import type { ContractDetail } from '../contractService'
import type { VendorSearchResult, VendorService } from '../vendorService'
import type { AppNotification } from '../../features/notifications/models/notifications.model'
import type { AdminBooking, AdminDashboardSummary, AdminEvent, AdminUser, AdminVendor } from '../../features/admin-operations/models/admin-operations.model'

export type MockScenarioId =
  | 'new_organizer_no_events'
  | 'organizer_active_procurement'
  | 'organizer_completed_event'
  | 'vendor_pending_b2b_requests'
  | 'vendor_active_contracts'
  | 'admin_pending_operations'

export interface MockScenarioData {
  id: MockScenarioId
  label: string
  events: LargeEvent[]
  requirements: EventRequirement[]
  vendors: VendorSearchResult[]
  vendorServices: VendorService[]
  bookings: BookingRequest[]
  contracts: ContractDetail[]
  notifications: AppNotification[]
  dashboardSummary: DashboardSummary
  adminSummary: AdminDashboardSummary
  adminUsers: AdminUser[]
  adminEvents: AdminEvent[]
  adminBookings: AdminBooking[]
  adminVendors: AdminVendor[]
  buildPortfolio: (eventId: string) => EventPortfolio
}

const completedEvents: LargeEvent[] = MOCK_EVENTS.map((event, index) => ({
  ...event,
  status: index === 0 ? 'completed' : event.status
}))

const completedBookings: BookingRequest[] = MOCK_BOOKINGS.map((booking) => ({
  ...booking,
  status: booking.event_id === 'evt-001' ? 'completed' : booking.status
}))

const noEventsSummary: DashboardSummary = {
  eventStatusSummary: { total: 0, draft: 0, planning: 0, booking: 0, confirmed: 0, completed: 0, cancelled: 0 },
  requirementSummary: { total: 0, open: 0, pendingBooking: 0, fulfilled: 0, cancelled: 0 },
  bookingSummary: { total: 0, pending: 0, accepted: 0, rejected: 0, changesRequested: 0, contractSent: 0, confirmed: 0, completed: 0, cancelled: 0 },
  upcomingEvents: [],
  recentActivity: []
}

function createScenario(overrides: Partial<MockScenarioData> & Pick<MockScenarioData, 'id' | 'label'>): MockScenarioData {
  return {
    id: overrides.id,
    label: overrides.label,
    events: overrides.events || MOCK_EVENTS,
    requirements: overrides.requirements || MOCK_REQUIREMENTS,
    vendors: overrides.vendors || MOCK_VENDORS,
    vendorServices: overrides.vendorServices || MOCK_VENDOR_SERVICES,
    bookings: overrides.bookings || MOCK_BOOKINGS,
    contracts: overrides.contracts || MOCK_CONTRACTS,
    notifications: overrides.notifications || MOCK_NOTIFICATIONS,
    dashboardSummary: overrides.dashboardSummary || MOCK_DASHBOARD_SUMMARY,
    adminSummary: overrides.adminSummary || MOCK_ADMIN_SUMMARY,
    adminUsers: overrides.adminUsers || MOCK_ADMIN_USERS,
    adminEvents: overrides.adminEvents || MOCK_ADMIN_EVENTS,
    adminBookings: overrides.adminBookings || MOCK_ADMIN_BOOKINGS,
    adminVendors: overrides.adminVendors || MOCK_ADMIN_VENDORS,
    buildPortfolio: overrides.buildPortfolio || buildMockPortfolio
  }
}

export const MOCK_SCENARIOS: Record<MockScenarioId, MockScenarioData> = {
  new_organizer_no_events: createScenario({
    id: 'new_organizer_no_events',
    label: 'New organizer with no events',
    events: [],
    requirements: [],
    bookings: [],
    contracts: [],
    notifications: MOCK_NOTIFICATIONS.filter((item) => item.notification_type === 'system'),
    dashboardSummary: noEventsSummary,
    buildPortfolio: () => ({
      event: MOCK_EVENTS[0],
      requirements: [],
      bookings: [],
      requirementSummary: {},
      bookingSummary: {}
    })
  }),
  organizer_active_procurement: createScenario({
    id: 'organizer_active_procurement',
    label: 'Organizer with active procurement'
  }),
  organizer_completed_event: createScenario({
    id: 'organizer_completed_event',
    label: 'Organizer with completed event',
    events: completedEvents,
    bookings: completedBookings,
    dashboardSummary: {
      ...MOCK_DASHBOARD_SUMMARY,
      eventStatusSummary: { ...MOCK_DASHBOARD_SUMMARY.eventStatusSummary, completed: 1 },
      bookingSummary: { ...MOCK_DASHBOARD_SUMMARY.bookingSummary, completed: 2, pending: 0 }
    }
  }),
  vendor_pending_b2b_requests: createScenario({
    id: 'vendor_pending_b2b_requests',
    label: 'Vendor with pending B2B requests',
    bookings: MOCK_BOOKINGS.filter((booking) => ['pending', 'accepted', 'confirmed'].includes(booking.status))
  }),
  vendor_active_contracts: createScenario({
    id: 'vendor_active_contracts',
    label: 'Vendor with active contracts',
    bookings: MOCK_BOOKINGS.filter((booking) => ['accepted', 'confirmed'].includes(booking.status))
  }),
  admin_pending_operations: createScenario({
    id: 'admin_pending_operations',
    label: 'Admin with pending operational actions'
  })
}

export function getActiveScenarioId(): MockScenarioId {
  const raw = localStorage.getItem('eventify_mock_scenario')
  return raw && raw in MOCK_SCENARIOS ? raw as MockScenarioId : 'organizer_active_procurement'
}

export function getActiveMockScenario(): MockScenarioData {
  return MOCK_SCENARIOS[getActiveScenarioId()]
}
