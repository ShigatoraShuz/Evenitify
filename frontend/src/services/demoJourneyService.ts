import { isMockMode } from '../config/apiConfig'
import type { UserProfile } from './authService'

export type DemoRole = 'organizer' | 'vendor' | 'admin'

export interface DemoJourney {
  role: DemoRole
  label: string
  description: string
  email: string
  route: string
  scenario: string
}

export const DEMO_JOURNEYS: DemoJourney[] = [
  {
    role: 'organizer',
    label: 'Organizer demo',
    description: 'Large event setup, vendor discovery, booking, contracts, and notifications.',
    email: 'organizer@eventify.com',
    route: '/organizer',
    scenario: 'organizer_active_procurement'
  },
  {
    role: 'vendor',
    label: 'Vendor demo',
    description: 'B2B request queue, service listings, status response, and contract signing.',
    email: 'vendor@eventify.com',
    route: '/vendor',
    scenario: 'vendor_pending_b2b_requests'
  },
  {
    role: 'admin',
    label: 'Admin demo',
    description: 'Operations dashboard, verification, booking override, and audit timeline.',
    email: 'admin@eventify.com',
    route: '/admin',
    scenario: 'admin_pending_operations'
  }
]

export const DEMO_SESSION_EVENT = 'eventify:demo-session'
const USER_CACHE_KEY = 'auth_user_cache'

function buildDemoUser(role: DemoRole): UserProfile {
  const journey = DEMO_JOURNEYS.find((item) => item.role === role) || DEMO_JOURNEYS[0]
  return {
    id: role === 'admin' ? 'usr-003' : role === 'vendor' ? 'usr-002' : 'usr-001',
    email: journey.email,
    role,
    display_name: role === 'admin' ? 'System Admin' : role === 'vendor' ? 'Elite Catering Co.' : 'TechCorp Events'
  }
}

export const demoJourneyService = {
  isAvailable: () => isMockMode(),

  getJourneys: () => DEMO_JOURNEYS,

  start: (role: DemoRole): DemoJourney => {
    if (!isMockMode()) {
      throw new Error('Demo role switching is only available in mock mode.')
    }
    const journey = DEMO_JOURNEYS.find((item) => item.role === role) || DEMO_JOURNEYS[0]
    const user = buildDemoUser(role)
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: `mock-token-${role}`,
      refresh_token: `mock-refresh-${role}`
    }))
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
    localStorage.setItem('onboarding_complete', 'true')
    localStorage.setItem('eventify_demo_role', role)
    localStorage.setItem('eventify_mock_scenario', journey.scenario)
    window.dispatchEvent(new CustomEvent(DEMO_SESSION_EVENT, { detail: { role, user } }))
    return journey
  },

  getActiveRole: (): DemoRole | null => {
    const role = localStorage.getItem('eventify_demo_role')
    return role === 'organizer' || role === 'vendor' || role === 'admin' ? role : null
  }
}
