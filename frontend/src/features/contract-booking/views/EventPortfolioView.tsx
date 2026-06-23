import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { Modal } from '../../../shared/components/Modal'
import { Input } from '../../../shared/components/Input'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ContractTimeline, buildContractTimeline } from '../components/ContractTimeline'
import type { EventPortfolio } from '../../../services/eventService'
import type { ContractDetail } from '../../../services/contractService'

interface EventPortfolioViewProps {
  portfolio: EventPortfolio | null
  loading: boolean
  submitting: boolean
  contractLoading: boolean
  error: string | null
  userRole: string | null
  detailedContract: ContractDetail | null
  expandedBookingId: string | null
  onLoadPortfolio: (eventId: string) => Promise<void>
  onExpandBooking: (bookingId: string) => Promise<void>
  onCreateContract: (bookingId: string, termsSummary?: string) => Promise<void>
  onSendContract: (contractId: string) => Promise<void>
  onSignOrganizer: (contractId: string) => Promise<void>
  onSignVendor: (contractId: string) => Promise<void>
  onClearError: () => void
}

export function EventPortfolioView({
  portfolio,
  loading,
  submitting,
  contractLoading,
  error,
  userRole,
  detailedContract,
  expandedBookingId,
  onLoadPortfolio,
  onExpandBooking,
  onCreateContract,
  onSendContract,
  onSignOrganizer,
  onSignVendor,
  onClearError
}: EventPortfolioViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createBookingId, setCreateBookingId] = useState<string | null>(null)
  const [termsSummary, setTermsSummary] = useState('')

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

  const { event, requirements, bookings } = portfolio

  const reqStats = {
    total: requirements?.length || 0,
    open: requirements?.filter((r: any) => r.requirement_status === 'open').length || 0,
    fulfilled: requirements?.filter((r: any) => r.requirement_status === 'fulfilled').length || 0
  }

  const bkStats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b: any) => b.status === 'pending').length || 0,
    accepted: bookings?.filter((b: any) => b.status === 'accepted').length || 0,
    confirmed: bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
    completed: bookings?.filter((b: any) => b.status === 'completed').length || 0,
    cancelled: bookings?.filter((b: any) => b.status === 'cancelled').length || 0
  }

  const contractForBooking = (bookingId: string): ContractDetail | null => {
    if (expandedBookingId === bookingId && detailedContract) {
      return detailedContract
    }
    return null
  }

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard value={reqStats.total} label="Requirements" color="text-gray-900" />
        <SummaryCard value={bkStats.pending} label="Pending" color="text-yellow-600" />
        <SummaryCard value={bkStats.accepted} label="Accepted" color="text-cyan-600" />
        <SummaryCard value={bkStats.confirmed} label="Confirmed" color="text-blue-600" />
        <SummaryCard value={bkStats.completed} label="Completed" color="text-emerald-600" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements ({requirements?.length || 0})</h2>
      {requirements?.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {requirements.map((req: any) => (
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
        <div className="space-y-4 mb-8">
          {bookings.map((booking: any) => {
            const isExpanded = expandedBookingId === booking.id
            const contract = isExpanded ? detailedContract : null
            const existingContract = booking.contracts?.[0]

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{booking.vendor_profiles?.business_name}</span>
                    <span className="text-sm text-gray-500 ml-2">{booking.event_requirements?.category}</span>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {booking.requested_budget && (
                  <p className="text-sm text-gray-500 mb-2">Budget: ${Number(booking.requested_budget).toLocaleString()}</p>
                )}

                <div className="flex items-center gap-2">
                  {existingContract ? (
                    <Button variant="ghost" onClick={() => onExpandBooking(booking.id)}>
                      {isExpanded ? 'Hide Contract' : 'View Contract'}
                    </Button>
                  ) : (
                    (booking.status === 'accepted' || booking.status === 'confirmed') && userRole === 'organizer' && (
                      <Button onClick={() => { setCreateBookingId(booking.id); setShowCreateModal(true) }}>
                        Create Contract
                      </Button>
                    )
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t pt-4">
                    {contractLoading ? (
                      <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    ) : contract ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            Contract {contract.contract_number ? `#${contract.contract_number}` : ''}
                          </h4>
                          <StatusBadge status={contract.contract_status} size="sm" />
                        </div>

                        {contract.terms_summary && (
                          <p className="text-sm text-gray-600 mb-3">{contract.terms_summary}</p>
                        )}

                        <ContractTimeline steps={buildContractTimeline(contract)} />

                        <div className="flex flex-wrap gap-2 mt-4">
                          {contract.contract_status === 'draft' && (
                            <Button onClick={() => onSendContract(contract.id)} loading={submitting}>
                              Send Contract
                            </Button>
                          )}
                          {contract.contract_status === 'sent' && userRole === 'organizer' && (
                            <Button onClick={() => onSignOrganizer(contract.id)} loading={submitting}>
                              Sign as Organizer
                            </Button>
                          )}
                          {contract.contract_status === 'organizer_signed' && userRole === 'vendor' && (
                            <Button onClick={() => onSignVendor(contract.id)} loading={submitting}>
                              Sign as Vendor
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-3">No contract found for this booking.</p>
                        {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                          <Button onClick={() => { setCreateBookingId(booking.id); setShowCreateModal(true) }}>
                            Create Contract
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState title="No bookings" description="Bookings will appear here after vendor procurement" />
      )}

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); setCreateBookingId(null) }} title="Create Contract">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Create a contract for this booking.</p>
          <Input
            label="Terms Summary (optional)"
            placeholder="Describe the contract terms..."
            value={termsSummary}
            onChange={(e) => setTermsSummary(e.target.value)}
          />
          <Button
            onClick={async () => {
              if (createBookingId) {
                await onCreateContract(createBookingId, termsSummary || undefined)
                await onExpandBooking(createBookingId)
                setShowCreateModal(false)
                setCreateBookingId(null)
                setTermsSummary('')
              }
            }}
            loading={submitting}
            fullWidth
          >
            Create Contract
          </Button>
        </div>
      </Modal>
    </DashboardShell>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
