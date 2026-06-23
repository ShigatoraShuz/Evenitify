import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../routes/index'
import { ADMIN_SIDEBAR, ORGANIZER_SIDEBAR, ROUTES, VENDOR_SIDEBAR } from '../routes/routeConstants'

describe('Route guards', () => {
  it('renders without crashing with no user', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/organizer']}>
        <AppRoutes userRole={null} profileComplete={false} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('renders without crashing with vendor role', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/vendor']}>
        <AppRoutes userRole="vendor" profileComplete={true} loading={false} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('renders without crashing with admin role', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppRoutes userRole="admin" profileComplete={true} loading={false} />
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
})
