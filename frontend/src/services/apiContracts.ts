/**
 * Eventify API Contract Mapping
 *
 * This file documents every expected backend endpoint,
 * its request/response types, and current implementation status.
 *
 * Status legend:
 *   ✅ mock    - implemented in mock adapter
 *   🔧 partial - partially implemented
 *   ❌ missing - not yet implemented in service or mock
 */

export interface ApiContract {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  description: string
  auth: boolean
  roles: string[]
  status: 'mock' | 'partial' | 'missing'
}

export const API_CONTRACTS: ApiContract[] = [
  // Auth
  { method: 'POST', path: '/auth/register', description: 'Register new user', auth: false, roles: [], status: 'mock' },
  { method: 'POST', path: '/auth/login', description: 'Login with email/password', auth: false, roles: [], status: 'mock' },
  { method: 'GET', path: '/auth/me', description: 'Get current user session', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'POST', path: '/auth/sync-profile', description: 'Sync user profile after registration', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'POST', path: '/auth/refresh', description: 'Refresh auth session token', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'missing' },
  { method: 'POST', path: '/auth/logout', description: 'Logout and invalidate session', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'missing' },

  // Onboarding
  { method: 'GET', path: '/onboarding/status', description: 'Check if onboarding is complete', auth: true, roles: ['organizer', 'vendor'], status: 'missing' },
  { method: 'POST', path: '/onboarding/complete', description: 'Submit onboarding profile', auth: true, roles: ['organizer', 'vendor'], status: 'missing' },

  // Organizer Profile
  { method: 'GET', path: '/organizer/profile', description: 'Get organizer profile', auth: true, roles: ['organizer'], status: 'missing' },
  { method: 'PATCH', path: '/organizer/profile', description: 'Update organizer profile', auth: true, roles: ['organizer'], status: 'missing' },

  // Admin Settings
  { method: 'GET', path: '/admin/settings', description: 'Get admin settings', auth: true, roles: ['admin'], status: 'missing' },
  { method: 'PATCH', path: '/admin/settings', description: 'Update admin settings', auth: true, roles: ['admin'], status: 'missing' },

  // Events
  { method: 'GET', path: '/events', description: 'List organizer events', auth: true, roles: ['organizer', 'admin'], status: 'mock' },
  { method: 'POST', path: '/events', description: 'Create large event', auth: true, roles: ['organizer'], status: 'mock' },
  { method: 'GET', path: '/events/:eventId', description: 'Get single event', auth: true, roles: ['organizer', 'admin'], status: 'mock' },
  { method: 'PATCH', path: '/events/:eventId', description: 'Update event details', auth: true, roles: ['organizer'], status: 'mock' },
  { method: 'GET', path: '/events/dashboard/summary', description: 'Organizer dashboard summary', auth: true, roles: ['organizer', 'admin'], status: 'mock' },
  { method: 'GET', path: '/events/:eventId/portfolio', description: 'Event portfolio with bookings/contracts', auth: true, roles: ['organizer', 'admin'], status: 'mock' },

  // Requirements
  { method: 'GET', path: '/events/:eventId/requirements', description: 'List event requirements', auth: true, roles: ['organizer', 'admin'], status: 'mock' },
  { method: 'POST', path: '/events/:eventId/requirements', description: 'Create event requirement', auth: true, roles: ['organizer'], status: 'mock' },
  { method: 'PATCH', path: '/requirements/:requirementId', description: 'Update requirement', auth: true, roles: ['organizer'], status: 'mock' },
  { method: 'DELETE', path: '/requirements/:requirementId', description: 'Delete requirement', auth: true, roles: ['organizer'], status: 'mock' },

  // Vendors
  { method: 'GET', path: '/vendors', description: 'Search vendors with filters', auth: true, roles: ['organizer', 'admin'], status: 'mock' },
  { method: 'GET', path: '/vendors/:vendorId', description: 'Get vendor profile + services', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'GET', path: '/vendor/profile', description: 'Get own vendor profile', auth: true, roles: ['vendor'], status: 'mock' },
  { method: 'PATCH', path: '/vendor/profile', description: 'Update own vendor profile', auth: true, roles: ['vendor'], status: 'mock' },
  { method: 'GET', path: '/vendor/services', description: 'List own services', auth: true, roles: ['vendor'], status: 'mock' },
  { method: 'POST', path: '/vendor/services', description: 'Create service listing', auth: true, roles: ['vendor'], status: 'mock' },
  { method: 'PATCH', path: '/vendor/services/:serviceId', description: 'Update service listing', auth: true, roles: ['vendor'], status: 'mock' },

  // Bookings
  { method: 'POST', path: '/procurement-requests', description: 'Create B2B booking request', auth: true, roles: ['organizer'], status: 'mock' },
  { method: 'GET', path: '/procurement-requests/:bookingId', description: 'Get booking details', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'GET', path: '/events/:eventId/bookings', description: 'List bookings for event', auth: true, roles: ['organizer', 'admin'], status: 'mock' },
  { method: 'GET', path: '/vendor/bookings', description: 'List vendor B2B bookings', auth: true, roles: ['vendor'], status: 'mock' },
  { method: 'GET', path: '/vendor/bookings/:bookingId', description: 'Get vendor booking detail', auth: true, roles: ['vendor'], status: 'mock' },
  { method: 'PATCH', path: '/vendor/bookings/:bookingId/status', description: 'Update booking status (vendor)', auth: true, roles: ['vendor'], status: 'mock' },

  // Contracts
  { method: 'POST', path: '/contracts/:bookingId', description: 'Create contract for booking', auth: true, roles: ['vendor', 'admin'], status: 'mock' },
  { method: 'GET', path: '/contracts/:bookingId', description: 'Get contract by booking', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'PATCH', path: '/contracts/:contractId/status', description: 'Update contract status', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'PATCH', path: '/contracts/:contractId/sign-organizer', description: 'Sign contract as organizer', auth: true, roles: ['organizer'], status: 'mock' },
  { method: 'PATCH', path: '/contracts/:contractId/sign-vendor', description: 'Sign contract as vendor', auth: true, roles: ['vendor'], status: 'mock' },

  // Notifications
  { method: 'GET', path: '/notifications', description: 'List user notifications', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'GET', path: '/notifications/unread-count', description: 'Get unread notification count', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'PATCH', path: '/notifications/:notificationId/read', description: 'Mark notification as read', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },
  { method: 'PATCH', path: '/notifications/read-all', description: 'Mark all notifications as read', auth: true, roles: ['organizer', 'vendor', 'admin'], status: 'mock' },

  // Admin
  { method: 'GET', path: '/admin/dashboard/summary', description: 'Admin dashboard summary', auth: true, roles: ['admin'], status: 'mock' },
  { method: 'GET', path: '/admin/users', description: 'List all users', auth: true, roles: ['admin'], status: 'mock' },
  { method: 'GET', path: '/admin/events', description: 'List all events', auth: true, roles: ['admin'], status: 'mock' },
  { method: 'GET', path: '/admin/bookings', description: 'List all bookings', auth: true, roles: ['admin'], status: 'mock' },
  { method: 'GET', path: '/admin/vendors', description: 'List all vendors', auth: true, roles: ['admin'], status: 'mock' },
  { method: 'PATCH', path: '/admin/vendors/:vendorId/verification', description: 'Update vendor verification status', auth: true, roles: ['admin'], status: 'mock' },
  { method: 'PATCH', path: '/admin/bookings/:bookingId/override-status', description: 'Override booking status', auth: true, roles: ['admin'], status: 'mock' },
]
