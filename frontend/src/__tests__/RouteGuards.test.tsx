import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../routes/index'

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
})
