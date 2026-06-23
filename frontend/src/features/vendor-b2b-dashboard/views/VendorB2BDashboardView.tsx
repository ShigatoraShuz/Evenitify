import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ContractTimeline, buildContractTimeline } from '../../contract-booking/components/ContractTimeline'
import type { BookingRequest } from '../../../services/bookingService'
import type { ContractDetail } from '../../../services/contractService'

interface VendorB2BDashboardViewProps {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: string
  loading: boolean
  submitting: boolean
  error: string | null
  contract: ContractDetail | null
  contractLoading: boolean
  onLoadBookings: (status?: string) => Promise<void>
  onSetTab: (tab: any) => void
  onSelectBooking: (bookingId: string) => Promise<void>
  onUpdateStatus: (bookingId: string, status: 'accepted' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>
  onClearError: () => void
  onLoadContract: (bookingId: string) => Promise<void>
  onSignVendorContract: (contractId: string) => Promise<void>
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' }
]

export function VendorB2BDashboardView({
  bookings,
  selectedBooking,
  activeTab,
  loading,
  submitting,
  error,
  contract,
  contractLoading,
  onLoadBookings,
  onSetTab,
  onSelectBooking,
  onUpdateStatus,
  onClearError,
  onLoadContract,
  onSignVendorContract
}: VendorB2BDashboardViewProps) {
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null)

  useEffect(() => { onLoadBookings() }, [])

  const handleDecline = async () => {
    if (confirmDecline) {
      await onUpdateStatus(confirmDecline, 'rejected')
      setConfirmDecline(null)
    }
  }

  return (
    <DashboardShell>
      <ConfirmDialog
        open={!!confirmDecline}
        title="Decline Booking"
        message="Are you sure you want to decline this booking request? This action cannot be undone."
        confirmLabel="Decline"
        variant="danger"
        loading={submitting}
        onConfirm={handleDecline}
        onCancel={() => setConfirmDecline(null)}
      />
      <PageHeader
        title="B2B Bookings"
        subtitle="Organizer and Large Event booking requests"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-3 text-center">
          <p className="text-xl font-bold text-yellow-600">{bookings.filter((b) => b.status === 'pending').length}</p>
          <p className="text-xs text-yellow-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{bookings.filter((b) => b.status === 'accepted').length}</p>
          <p className="text-xs text-green-600">Accepted</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-3 text-center">
          <p className="text-xl font-bold text-red-600">{bookings.filter((b) => b.status === 'rejected').length}</p>
          <p className="text-xs text-red-600">Declined</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{bookings.filter((b) => b.status === 'completed').length}</p>
          <p className="text-xs text-blue-600">Completed</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSetTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab.key ? 'bg-white border border-b-0 border-gray-200 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : selectedBooking ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedBooking.large_events?.title || 'Event'}
            </h3>
            <StatusBadge status={selectedBooking.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div><span className="text-gray-500">Organizer:</span> {selectedBooking.organizer_profiles?.organization_name}</div>
            <div><span className="text-gray-500">Category:</span> {selectedBooking.event_requirements?.category}</div>
            <div><span className="text-gray-500">Date:</span> {selectedBooking.large_events?.event_date ? new Date(selectedBooking.large_events.event_date).toLocaleDateString() : 'N/A'}</div>
            <div><span className="text-gray-500">Venue:</span> {selectedBooking.large_events?.venue}</div>
            <div><span className="text-gray-500">Guests:</span> {selectedBooking.large_events?.expected_guests}</div>
            <div><span className="text-gray-500">Budget:</span> ${selectedBooking.requested_budget ? Number(selectedBooking.requested_budget).toLocaleString() : 'N/A'}</div>
          </div>
          {selectedBooking.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <span className="font-medium text-gray-700">Notes:</span> {selectedBooking.notes}
            </div>
          )}

          {selectedBooking.status === 'pending' && (
            <div className="flex gap-3 mb-6">
              <Button onClick={() => onUpdateStatus(selectedBooking.id, 'accepted')} loading={submitting}>Accept</Button>
              <Button variant="secondary" onClick={() => onUpdateStatus(selectedBooking.id, 'changes_requested')} loading={submitting}>Request Changes</Button>
              <Button variant="danger" onClick={() => setConfirmDecline(selectedBooking.id)} loading={submitting}>Decline</Button>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Contract</h4>
              <Button variant="ghost" onClick={() => onLoadContract(selectedBooking.id)}>
                {contract ? 'Refresh' : 'View Contract'}
              </Button>
            </div>

            {contractLoading ? (
              <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ) : contract ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {contract.contract_number ? `#${contract.contract_number}` : ''}
                  </span>
                  <StatusBadge status={contract.contract_status} size="sm" />
                </div>
                {contract.terms_summary && (
                  <p className="text-sm text-gray-600 mb-3">{contract.terms_summary}</p>
                )}
                <ContractTimeline steps={buildContractTimeline(contract)} />
                {contract.contract_status === 'organizer_signed' && (
                  <div className="mt-3">
                    <Button onClick={() => onSignVendorContract(contract.id)} loading={submitting}>
                      Sign as Vendor
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No contract yet. Contracts appear after the organizer creates one.</p>
            )}
          </div>

          <button onClick={() => onSelectBooking('')} className="mt-4 text-sm text-brand-600 hover:text-brand-700">← Back to list</button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No B2B bookings"
          description="Organizer booking requests will appear here"
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => onSelectBooking(booking.id)}
              className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{booking.large_events?.title || 'Event'}</h3>
                <StatusBadge status={booking.status} size="sm" />
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{booking.organizer_profiles?.organization_name}</span>
                <span>{booking.event_requirements?.category}</span>
                <span>${booking.requested_budget ? Number(booking.requested_budget).toLocaleString() : 'N/A'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
