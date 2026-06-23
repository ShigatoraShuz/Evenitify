import { useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { EventPortfolio } from '../../../services/eventService'

interface EventPortfolioViewProps {
  portfolio: EventPortfolio | null
  loading: boolean
  error: string | null
  onLoadPortfolio: (eventId: string) => Promise<void>
  onClearError: () => void
}

export function EventPortfolioView({
  portfolio,
  loading,
  error,
  onLoadPortfolio,
  onClearError
}: EventPortfolioViewProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const eventId = params.get('eventId')
    if (eventId) onLoadPortfolio(eventId)
  }, [])

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </DashboardShell>
    )
  }

  if (!portfolio) {
    return (
      <DashboardShell>
        <EmptyState title="No event selected" description="Select an event to view its portfolio" />
      </DashboardShell>
    )
  }

  const { event, requirements, bookings, requirementSummary, bookingSummary } = portfolio

  return (
    <DashboardShell>
      <PageHeader
        title={event.title}
        subtitle={`${event.venue} | ${new Date(event.event_date).toLocaleDateString()} | ${event.expected_guests} guests`}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-gray-900">{requirementSummary?.total || 0}</p>
          <p className="text-sm text-gray-500">Requirements</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-yellow-600">{bookingSummary?.pending || 0}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-cyan-600">{bookingSummary?.confirmed || 0}</p>
          <p className="text-sm text-gray-500">Confirmed</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-green-600">{bookingSummary?.completed || 0}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements ({requirements?.length || 0})</h2>
      {requirements?.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900">{req.category}</h3>
                <StatusBadge status={req.requirement_status} size="sm" />
              </div>
              <p className="text-sm text-gray-500">Qty: {req.quantity}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-8">No requirements defined yet.</p>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Bookings ({bookings?.length || 0})</h2>
      {bookings?.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900">{booking.vendor_profiles?.business_name}</span>
                  <span className="text-sm text-gray-500 ml-2">{booking.event_requirements?.category}</span>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              {booking.requested_budget && (
                <p className="text-sm text-gray-500">Budget: ${Number(booking.requested_budget).toLocaleString()}</p>
              )}
              {booking.contracts?.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-500">Contracts:</span>
                  {booking.contracts.map((c: any) => (
                    <StatusBadge key={c.id} status={c.contract_status} size="sm" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No bookings" description="Bookings will appear here after vendor procurement" />
      )}
    </DashboardShell>
  )
}
