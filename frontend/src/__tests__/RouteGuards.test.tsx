import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../routes/index'
import { ADMIN_SIDEBAR, ORGANIZER_SIDEBAR, ROUTES, VENDOR_SIDEBAR } from '../routes/routeConstants'
import type { UserProfile, UserRole } from '../services/authService'

function makeUser(roles: UserRole[], role: UserRole | null = roles[0] || null): UserProfile {
  return {
    id: 'usr-test',
    email: 'test@eventify.com',
    role,
    selectedRole: role,
    roles,
    display_name: 'Test User',
    hasOrganizerProfile: roles.includes('organizer'),
    hasVendorProfile: roles.includes('vendor'),
    setupComplete: roles.length > 0
  }
}

describe('Route guards', () => {
  it('renders without crashing with no user', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/organizer']}>
        <AppRoutes user={null} activeRole={null} userRoles={[]} roleChosen={false} profileComplete={false} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('renders without crashing with vendor role', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/vendor']}>
        <AppRoutes user={makeUser(['vendor'])} activeRole="vendor" userRoles={['vendor']} roleChosen={true} profileComplete={true} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('renders without crashing with admin role', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppRoutes user={makeUser(['admin'])} activeRole="admin" userRoles={['admin']} roleChosen={true} profileComplete={true} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('registers protected report routes in role sidebars', () => {
    expect(ROUTES.ORGANIZER_REPORTS.path).toBe('/organizer/reports')
    expect(ROUTES.VENDOR_REPORTS.path).toBe('/vendor/reports')
    expect(ROUTES.ADMIN_REPORTS.path).toBe('/admin/reports')
    expect(ORGANIZER_SIDEBAR).toContain(ROUTES.ORGANIZER_REPORTS)
    expect(VENDOR_SIDEBAR).toContain(ROUTES.VENDOR_REPORTS)
    expect(ADMIN_SIDEBAR).toContain(ROUTES.ADMIN_REPORTS)
  })

  it('renders without crashing for authenticated users before role choice', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/organizer']}>
        <AppRoutes user={makeUser([], null)} activeRole={null} userRoles={[]} roleChosen={false} profileComplete={false} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('allows dual-role users into organizer and vendor routes', () => {
    const user = makeUser(['organizer', 'vendor'], 'organizer')
    const { container } = render(
      <MemoryRouter initialEntries={['/vendor']}>
        <AppRoutes user={user} activeRole="organizer" userRoles={['organizer', 'vendor']} roleChosen={true} profileComplete={true} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })
})
