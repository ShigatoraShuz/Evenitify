import { MOCK_EVENTS, MOCK_REQUIREMENTS, MOCK_VENDORS, MOCK_VENDOR_SERVICES, MOCK_BOOKINGS, MOCK_CONTRACTS, MOCK_NOTIFICATIONS, MOCK_ADMIN_SUMMARY, MOCK_ADMIN_USERS, MOCK_ADMIN_EVENTS, MOCK_ADMIN_BOOKINGS, MOCK_ADMIN_VENDORS, MOCK_DASHBOARD_SUMMARY, buildMockPortfolio } from './mockData'

type MockHandler = (endpoint: string, body?: unknown) => unknown

const MOCK_REGISTRY: Record<string, MockHandler> = {
  // Auth
  'POST /auth/register': (_, body) => {
    const payload = body as { email: string; password: string; role: string }
    return { session: { access_token: 'mock-token-' + Date.now(), refresh_token: 'mock-refresh-' + Date.now() }, user: { id: 'usr-new', email: payload.email, role: payload.role } }
  },
  'POST /auth/login': (_, body) => {
    const payload = body as { email: string; password: string }
    return { session: { access_token: 'mock-token-' + Date.now(), refresh_token: 'mock-refresh-' + Date.now() }, user: { id: payload.email === 'admin@eventify.com' ? 'usr-003' : payload.email === 'vendor@eventify.com' ? 'usr-002' : 'usr-001', email: payload.email, role: payload.email === 'admin@eventify.com' ? 'admin' : payload.email === 'vendor@eventify.com' ? 'vendor' : 'organizer' } }
  },
  'GET /auth/me': () => {
    const cached = localStorage.getItem('auth_user_cache')
    if (cached) return JSON.parse(cached)
    return { id: 'usr-001', email: 'organizer@eventify.com', role: 'organizer', display_name: 'TechCorp Events' }
  },
  'POST /auth/sync-profile': (_, body) => {
    const payload = body as { role?: string } | undefined
    return { id: 'usr-001', email: 'organizer@eventify.com', role: payload?.role || 'organizer', display_name: 'TechCorp Events' }
  },

  // Events
  'GET /events': () => MOCK_EVENTS,
  'GET /events/dashboard/summary': () => MOCK_DASHBOARD_SUMMARY,
  'POST /events': (_, body) => {
    const payload = body as { title: string; eventDate: string; venue: string; budget: number; expectedGuests: number }
    return { id: 'evt-new', organizer_id: 'org-001', title: payload.title, event_date: payload.eventDate, venue: payload.venue, budget: payload.budget, expected_guests: payload.expectedGuests, status: 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  },
  'PATCH /events/': (endpoint, body) => {
    const eventId = endpoint.split('/')[2]
    const event = MOCK_EVENTS.find((e) => e.id === eventId)
    if (!event) throw new Error('Event not found')
    return { ...event, ...(body as Partial<typeof event>) }
  },

  // Portfolio
  'GET /events//portfolio': () => buildMockPortfolio('evt-001'),
  'GET /events/': (endpoint) => {
    const eventId = endpoint.split('/')[2]
    if (endpoint.endsWith('/portfolio')) {
      return buildMockPortfolio(eventId)
    }
    if (endpoint.endsWith('/requirements')) {
      return MOCK_REQUIREMENTS.filter((r) => r.event_id === eventId)
    }
    if (endpoint.endsWith('/bookings')) {
      return MOCK_BOOKINGS.filter((b) => b.event_id === eventId)
    }
    return MOCK_EVENTS.find((e) => e.id === eventId) || null
  },
  'POST /events/': (endpoint, body) => {
    if (endpoint.endsWith('/requirements')) {
      const payload = body as { category: string; quantity: number; minBudget?: number | null; maxBudget?: number | null; notes?: string | null }
      return { id: 'req-new', event_id: endpoint.split('/')[2], category: payload.category, quantity: payload.quantity, min_budget: payload.minBudget ?? null, max_budget: payload.maxBudget ?? null, requirement_status: 'open', notes: payload.notes ?? null, created_at: new Date().toISOString() }
    }
    return null
  },
  'PATCH /requirements/': (endpoint, body) => {
    const reqId = endpoint.split('/')[2]
    const req = MOCK_REQUIREMENTS.find((r) => r.id === reqId)
    if (!req) throw new Error('Requirement not found')
    return { ...req, ...(body as Partial<typeof req>) }
  },
  'DELETE /requirements/': () => ({}),
  'PATCH //adjust-budget': (_, body) => {
    const payload = body as { totalBudget: number }
    return { ...MOCK_EVENTS[0], budget: payload.totalBudget }
  },

  // Vendors
  'GET /vendors': () => MOCK_VENDORS,
  'GET /vendor/profile': () => ({
    id: 'ven-001', user_id: 'usr-002', business_name: 'Elite Catering Co.', contact_number: '+63 912 345 6789', service_area: 'Metro Manila', rating: 4.8, verification_status: 'verified', services: MOCK_VENDOR_SERVICES.filter((s) => s.vendor_id === 'ven-001')
  }),
  'PATCH /vendor/profile': (_, body) => body,
  'GET /vendor/services': () => MOCK_VENDOR_SERVICES,
  'POST /vendor/services': (_, body) => {
    const payload = body as { category: string; serviceName: string; description?: string | null; basePrice: number; availabilityStatus?: string }
    return { id: 'svc-new', vendor_id: 'ven-001', category: payload.category, service_name: payload.serviceName, description: payload.description ?? null, base_price: payload.basePrice, availability_status: payload.availabilityStatus ?? 'available' }
  },
  'PATCH /vendor/services/': (endpoint, body) => {
    const svcId = endpoint.split('/')[3]
    const svc = MOCK_VENDOR_SERVICES.find((s) => s.id === svcId)
    if (!svc) throw new Error('Service not found')
    return { ...svc, ...(body as Partial<typeof svc>) }
  },
  'GET /vendors/': (endpoint) => {
    const vendorId = endpoint.split('/')[2]
    return MOCK_VENDORS.find((v) => v.id === vendorId) || null
  },

  // Bookings
  'POST /procurement-requests': (_, body) => {
    const payload = body as { eventId: string; requirementId: string; vendorId: string; notes?: string | null; requestedBudget?: number | null }
    const vendor = MOCK_VENDORS.find((v) => v.id === payload.vendorId)
    const req = MOCK_REQUIREMENTS.find((r) => r.id === payload.requirementId)
    return { id: 'bok-new', event_id: payload.eventId, requirement_id: payload.requirementId, vendor_id: payload.vendorId, organizer_id: 'org-001', booking_type: 'B2B', status: 'pending', requested_budget: payload.requestedBudget ?? null, notes: payload.notes ?? null, requested_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_profiles: { business_name: vendor?.business_name || '', rating: vendor?.rating || 0, verification_status: vendor?.verification_status || 'pending' }, event_requirements: { category: req?.category || '', quantity: req?.quantity || 0 }, organizer_profiles: { organization_name: 'TechCorp Events' } }
  },
  'GET /procurement-requests/': (endpoint) => {
    if (endpoint.includes('by-vendor')) return MOCK_BOOKINGS
    const bookingId = endpoint.split('/')[2]
    return MOCK_BOOKINGS.find((b) => b.id === bookingId) || null
  },
  'GET /vendor/bookings': () => MOCK_BOOKINGS,
  'GET /vendor/bookings/': (endpoint) => {
    const bookingId = endpoint.split('/')[3]
    return MOCK_BOOKINGS.find((b) => b.id === bookingId) || null
  },
  'PATCH /vendor/bookings/': (endpoint, body) => {
    const parts = endpoint.split('/')
    const bookingId = parts[3]
    const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId)
    if (!booking) throw new Error('Booking not found')
    const payload = body as { status: string; reason?: string | null }
    return { ...booking, status: payload.status, updated_at: new Date().toISOString() }
  },

  // Contracts
  'POST /contracts/': (endpoint) => {
    const bookingId = endpoint.split('/')[2]
    return { id: 'con-new', booking_id: bookingId, contract_number: 'CT-NEW-' + Date.now(), contract_url: null, storage_path: null, contract_status: 'draft', terms_summary: null, sent_at: null, organizer_signed_at: null, vendor_signed_at: null, signed_at: null, final_status: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  },
  'GET /contracts/': (endpoint) => {
    const bookingId = endpoint.split('/')[2]
    return MOCK_CONTRACTS.find((c) => c.booking_id === bookingId) || null
  },
  'PATCH /contracts/': (endpoint, body) => {
    const parts = endpoint.split('/')
    const contractId = parts[2]
    const action = parts[3]
    const contract = MOCK_CONTRACTS.find((c) => c.id === contractId)
    if (!contract) throw new Error('Contract not found')
    if (action === 'status') {
      const payload = body as { status: string; reason?: string | null }
      return { ...contract, contract_status: payload.status, updated_at: new Date().toISOString() }
    }
    if (action === 'sign-organizer') {
      return { ...contract, contract_status: 'organizer_signed', organizer_signed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    }
    if (action === 'sign-vendor') {
      const newStatus = contract.contract_status === 'organizer_signed' ? 'signed' : 'vendor_signed'
      return { ...contract, contract_status: newStatus, vendor_signed_at: new Date().toISOString(), signed_at: newStatus === 'signed' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }
    }
    return contract
  },

  // Notifications
  'GET /notifications': () => MOCK_NOTIFICATIONS,
  'GET /notifications/unread-count': () => ({ count: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length }),
  'PATCH /notifications/': (endpoint) => {
    if (endpoint.endsWith('/read-all')) return { message: 'All notifications marked as read' }
    const notifId = endpoint.split('/')[2]
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === notifId)
    if (!notif) throw new Error('Notification not found')
    return { ...notif, is_read: true }
  },

  // Admin
  'GET /admin/dashboard/summary': () => MOCK_ADMIN_SUMMARY,
  'GET /admin/users': () => MOCK_ADMIN_USERS,
  'GET /admin/events': () => MOCK_ADMIN_EVENTS,
  'GET /admin/bookings': () => MOCK_ADMIN_BOOKINGS,
  'GET /admin/vendors': () => MOCK_ADMIN_VENDORS,
  'PATCH /admin/vendors/': (endpoint, body) => {
    const parts = endpoint.split('/')
    const vendorId = parts[3]
    if (parts[4] === 'verification') {
      const payload = body as { verificationStatus: string; reason?: string | null }
      const vendor = MOCK_ADMIN_VENDORS.find((v) => v.id === vendorId)
      if (!vendor) throw new Error('Vendor not found')
      return { ...vendor, verification_status: payload.verificationStatus }
    }
    return null
  },
  'PATCH /admin/bookings/': (endpoint, body) => {
    const parts = endpoint.split('/')
    const bookingId = parts[3]
    if (parts[4] === 'override-status') {
      const payload = body as { status: string; reason: string }
      const booking = MOCK_ADMIN_BOOKINGS.find((b) => b.id === bookingId)
      if (!booking) throw new Error('Booking not found')
      return { ...booking, status: payload.status }
    }
    return null
  },
}

function findMockHandler(method: string, endpoint: string): MockHandler | undefined {
  const normalized = endpoint.replace(/^\/api/, '')
  const parts = normalized.split('/').filter(Boolean)

  for (const [key, handler] of Object.entries(MOCK_REGISTRY)) {
    const [keyMethod, ...keyPathParts] = key.split(' ')
    const keyPath = '/' + keyPathParts.join('/')
    if (keyMethod !== method) continue

    if (key.endsWith('/')) {
      const keyBase = keyPath.replace(/\/$/, '')
      if (normalized.startsWith(keyBase)) return handler
    } else {
      if (normalized === keyPath) return handler
    }
  }

  for (const [key, handler] of Object.entries(MOCK_REGISTRY)) {
    if (!key.startsWith(method)) continue
    const keyPattern = key.substring(method.length + 1).replace(/\/$/, '')
    if (normalized.startsWith(keyPattern) && parts.length >= keyPattern.split('/').filter(Boolean).length) {
      return handler
    }
  }

  return undefined
}

export function getMockResponse<T>(method: string, endpoint: string, body?: unknown): T | undefined {
  const handler = findMockHandler(method, endpoint)
  if (!handler) return undefined
  try {
    return handler(endpoint, body) as T
  } catch {
    return undefined
  }
}
