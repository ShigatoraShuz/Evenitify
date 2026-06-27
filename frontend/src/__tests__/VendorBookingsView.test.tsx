import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { VendorBookingsView } from '../features/vendor-b2b-dashboard/views/VendorBookingsView'
import type { BookingRequest } from '../services/bookingService'

const organizerNotes = [
  'Event type: Corporate event',
  'Description: A long organizer brief that explains the event goals, setup flow, and guest experience in a way that should remain readable inside the compact vendor rail.',
  'Theme: Clean corporate slate',
  'Color palette: Ivory + gold',
  'Mood: Professional, polished, and efficient',
  'Setup: Hybrid',
  'Schedule: 2026-06-27 at 18:30 for 6 hour(s) across 1 day(s)',
  'Event date: 2026-06-27',
  'Event time: 18:30',
  'Duration: 6',
  'Days: 1',
  'Seating: Banquet',
  'Stage setup: Panel stage',
  'Booth setup: Expo grid',
  'Services: Catering, Photography, Security',
  'Service focus: Catering',
  'Catering needs: Full-service catering with dietary handling.',
  'Lighting needs: Architectural wash lighting and focused stage spots.',
  'Sound needs: Distributed speakers and microphones.',
  'Decoration needs: Minimal branding and sculptural florals.',
  'Photography needs: Editorial capture with same-day recap.',
  'Security needs: Guest check-in and perimeter coverage.',
  'Transportation needs: Shuttle support for VIP arrivals.',
  'Equipment rental needs: Tables, chairs, lecterns, power distribution, and staging.',
  'Special requirements: Accessible routes and quiet room.',
  'Vendor notes: Prioritize vendors with premium presentation.',
  'Unexpected note: Keep a backup greenroom'
].join('\n')

const booking = {
  id: 'booking-1',
  event_id: 'event-1',
  requirement_id: 'requirement-1',
  vendor_id: 'vendor-1',
  organizer_id: 'organizer-1',
  booking_type: 'large_event',
  status: 'pending',
  requested_budget: 10714,
  notes: 'Organizer request note',
  requested_at: '2026-06-20T12:00:00.000Z',
  updated_at: '2026-06-20T12:00:00.000Z',
  large_events: {
    title: 'Testing',
    event_date: '2026-06-27',
    venue: 'Rooftop venue',
    expected_guests: 750,
    budget: 10714,
    status: 'planning'
  },
  event_requirements: {
    category: 'Catering',
    quantity: 1,
    min_budget: 9000,
    max_budget: 12000,
    notes: organizerNotes,
    requirement_status: 'open'
  },
  organizer_profiles: {
    organization_name: 'Organization'
  },
  request_vendors: [
    {
      request_message: 'is this still available',
      deadline: '2026-06-21T00:00:00.000Z'
    }
  ],
  requestedServices: [
    { id: 'service-1', serviceName: 'Catering', category: 'Catering' },
    { id: 'service-2', serviceName: 'Photography', category: 'Photo/Video' },
    { id: 'service-3', serviceName: 'Security', category: 'Staff' }
  ]
} as BookingRequest

describe('VendorBookingsView', () => {
  it('renders the organizer brief with explicit labels and legacy aliases', () => {
    render(
      <MemoryRouter>
        <VendorBookingsView
          bookings={[booking]}
          selectedBooking={booking}
          activeTab="all"
          activeTypeTab="all"
          loading={false}
          submitting={false}
          error={null}
          contract={null}
          contractLoading={false}
          auditActivities={[]}
          bookingMessages={[]}
          realtimeSnapshot={null}
          realtimeRefreshing={false}
          onRefreshRealtime={vi.fn()}
          onLoadBookings={vi.fn()}
          onSetTab={vi.fn()}
          onSetTypeTab={vi.fn()}
          onSelectBooking={vi.fn()}
          onUpdateStatus={vi.fn()}
          onClearError={vi.fn()}
          onLoadContract={vi.fn()}
          onSignVendorContract={vi.fn()}
          onSendBookingMessage={vi.fn()}
          userRole="vendor"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Event Builder Summary')).toBeInTheDocument()
    expect(screen.getByText('Core Brief')).toBeInTheDocument()
    expect(screen.getByText('Timing & Setup')).toBeInTheDocument()
    expect(screen.getByText('Production Needs')).toBeInTheDocument()
    expect(screen.getByText('Vendor Brief')).toBeInTheDocument()
    expect(screen.getByText('Event type')).toBeInTheDocument()
    expect(screen.getByText('Setup mode')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Catering, Photography, Security')).toBeInTheDocument()
    expect(screen.getByText('Unexpected note')).toBeInTheDocument()
    expect(screen.getByText('Keep a backup greenroom')).toBeInTheDocument()
    expect(screen.getByText(/long organizer brief/i)).toHaveClass('whitespace-pre-wrap')
  })
})
