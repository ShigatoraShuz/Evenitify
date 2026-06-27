import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { VendorB2BDashboardView } from '../features/vendor-b2b-dashboard/views/VendorB2BDashboardView'
import { getRequestTypeFromGuests, getRequestTypeLabel } from '../features/vendor-b2b-dashboard/models/vendor-b2b-dashboard.model'
import type { BookingRequest } from '../services/bookingService'

const makeBooking = (id: string, title: string, guests: number): BookingRequest =>
  ({
    id,
    event_id: `${id}-event`,
    requirement_id: `${id}-requirement`,
    vendor_id: 'vendor-1',
    organizer_id: 'organizer-1',
    booking_type: 'B2B',
    status: 'pending',
    requested_budget: 5000,
    notes: null,
    requested_at: '2026-06-20T12:00:00.000Z',
    updated_at: '2026-06-20T12:00:00.000Z',
    large_events: {
      title,
      event_date: '2026-06-27',
      venue: 'Grand Hall',
      expected_guests: guests,
      budget: 5000,
      status: 'planning',
    },
    event_requirements: {
      category: 'Catering',
      quantity: 1,
    },
    organizer_profiles: {
      organization_name: 'Northwind',
    },
    requestedServices: [
      { id: `${id}-service`, serviceName: 'Catering', category: 'Catering' },
    ],
  }) as BookingRequest

describe('vendor booking request type filter', () => {
  it('splits requests by guest count at 20 guests', () => {
    expect(getRequestTypeFromGuests(21)).toBe('large_event')
    expect(getRequestTypeFromGuests(20)).toBe('personal')
    expect(getRequestTypeFromGuests(1)).toBe('personal')
    expect(getRequestTypeFromGuests(0)).toBeNull()
    expect(getRequestTypeFromGuests(null)).toBeNull()
    expect(getRequestTypeLabel(21)).toBe('Large Event')
    expect(getRequestTypeLabel(20)).toBe('Micro Event')
    expect(getRequestTypeLabel(undefined)).toBe('Guest count unavailable')
  })

  it('renders the same guest-count classification in the vendor dashboard badge', () => {
    const microBooking = makeBooking('micro', 'Neighborhood Picnic', 12)
    const largeBooking = makeBooking('large', 'Alpha Gala', 35)

    render(
      <MemoryRouter>
        <VendorB2BDashboardView
          bookings={[microBooking, largeBooking]}
          selectedBooking={null}
          activeTab="all"
          activeTypeTab="all"
          loading={false}
          submitting={false}
          error={null}
          realtimeSnapshot={null}
          realtimeRefreshing={false}
          onLoadBookings={vi.fn()}
          onRefreshRealtime={vi.fn()}
          onSetTab={vi.fn()}
          onSetTypeTab={vi.fn()}
          onSelectBooking={vi.fn()}
          onUpdateStatus={vi.fn()}
          onSubmitQuote={vi.fn()}
          onClearError={vi.fn()}
        />
      </MemoryRouter>
    )

    const microCard = screen.getByRole('button', { name: /Neighborhood Picnic/i })
    const largeCard = screen.getByRole('button', { name: /Alpha Gala/i })

    expect(within(microCard).getByText('Micro Event')).toBeInTheDocument()
    expect(within(largeCard).getByText('Large Event')).toBeInTheDocument()
  })
})
