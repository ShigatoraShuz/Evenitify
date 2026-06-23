import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { Modal } from '../../../shared/components/Modal'
import { Input } from '../../../shared/components/Input'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ContractTimeline, buildContractTimeline } from '../components/ContractTimeline'
import type { EventPortfolio } from '../../../services/eventService'
import type { ContractDetail } from '../../../services/contractService'
import type { PortfolioTab } from '../viewmodels/useEventPortfolio'

interface VendorInfo {
  vendorId: string
  business_name: string
  rating: number
}

interface ContractItem {
  id: string
  bookingId: string
  contract_status: string
  sent_at: string | null
  signed_at: string | null
  vendorName: string
  category: string
}

interface ActivityItem {
  id: string
  booking_id: string
  previous_status: string | null
  new_status: string
  reason: string | null
  created_at: string
  vendorName: string
  category: string
}

interface EventPortfolioViewProps {
  eventId: string | null
  portfolio: EventPortfolio | null
  loading: boolean
  submitting: boolean
  contractLoading: boolean
  error: string | null
  userRole: string | null
  detailedContract: ContractDetail | null
  expandedBookingId: string | null
  activeTab: PortfolioTab
  vendors: VendorInfo[]
  contracts: ContractItem[]
  activity: ActivityItem[]
  onLoadPortfolio: (eventId: string) => Promise<void>
  onSetActiveTab: (tab: PortfolioTab) => void
  onExpandBooking: (bookingId: string) => Promise<void>
  onCreateContract: (bookingId: string, termsSummary?: string) => Promise<void>
  onSendContract: (contractId: string) => Promise<void>
  onSignOrganizer: (contractId: string) => Promise<void>
  onSignVendor: (contractId: string) => Promise<void>
  onClearError: () => void
}

const TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'activity', label: 'Activity' }
]

export function EventPortfolioView({
  eventId,
  portfolio,
  loading,
  submitting,
  contractLoading,
  error,
  userRole,
  detailedContract,
  expandedBookingId,
  activeTab,
  vendors,
  contracts,
  activity,
  onLoadPortfolio,
  onSetActiveTab,
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
    if (eventId) onLoadPortfolio(eventId)
  }, [eventId])

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

  const completionPct = reqStats.total > 0 ? Math.round((reqStats.fulfilled / reqStats.total) * 100) : 0
  const totalBudget = Number(event.budget) || 0
  const usedBudget = bookings?.reduce((sum: number, b: any) => sum + (Number(b.requested_budget) || 0), 0) || 0
  const budgetPct = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0

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

      <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSetActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white border border-b-0 border-gray-200 text-brand-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard value={`${completionPct}%`} label="Requirements Complete" color="text-emerald-600" sub={`${reqStats.fulfilled}/${reqStats.total}`} />
            <SummaryCard value={vendors.length} label="Vendors Engaged" color="text-blue-600" />
            <SummaryCard value={`${budgetPct}%`} label="Budget Used" color={budgetPct > 80 ? 'text-red-600' : 'text-indigo-600'} sub={`$${usedBudget.toLocaleString()}/$${totalBudget.toLocaleString()}`} />
            <SummaryCard value={bookings?.length || 0} label="Total Bookings" color="text-gray-900" sub={`${bkStats.pending} pending`} />
          </div>

          {budgetPct > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Budget Utilization</span>
                <span>{budgetPct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${budgetPct > 80 ? 'bg-red-500' : budgetPct > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {activity.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                    <div>
                      <p className="text-gray-700">
                        <span className="font-medium">{item.vendorName || 'Unknown'}</span>
                        {' '}{item.category && `(${item.category})`}{' '}
                        changed to <StatusBadge status={item.new_status} size="sm" />
                      </p>
                      <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.length === 0 && (
            <EmptyState title="No activity yet" description="Activity will appear as bookings and contracts progress" />
          )}
        </div>
      )}

      {activeTab === 'requirements' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <SummaryCard value={reqStats.total} label="Total" color="text-gray-900" />
            <SummaryCard value={reqStats.open} label="Open" color="text-yellow-600" />
            <SummaryCard value={reqStats.fulfilled} label="Fulfilled" color="text-emerald-600" />
          </div>

          {requirements?.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 mb-8">
              {requirements.map((req: any) => (
                <div key={req.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{req.category}</h3>
                    <StatusBadge status={req.requirement_status} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">Qty: {req.quantity}</p>
                  {req.min_budget && <p className="text-sm text-gray-500">Min: ${Number(req.min_budget).toLocaleString()}</p>}
                  {req.max_budget && <p className="text-sm text-gray-500">Max: ${Number(req.max_budget).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No requirements" description="No requirements defined yet." />
          )}
        </div>
      )}

      {activeTab === 'vendors' && (
        <div>
          {vendors.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {vendors.map((v) => (
                <div key={v.vendorId} className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">{v.business_name}</h3>
                  <p className="text-sm text-yellow-600">Rating: {v.rating || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No vendors" description="Vendors will appear once bookings are created." />
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <SummaryCard value={bkStats.total} label="Total" color="text-gray-900" />
            <SummaryCard value={bkStats.pending} label="Pending" color="text-yellow-600" />
            <SummaryCard value={bkStats.accepted} label="Accepted" color="text-cyan-600" />
            <SummaryCard value={bkStats.confirmed} label="Confirmed" color="text-blue-600" />
            <SummaryCard value={bkStats.completed} label="Completed" color="text-emerald-600" />
            <SummaryCard value={bkStats.cancelled} label="Cancelled" color="text-red-600" />
          </div>

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
                                <Button onClick={() => onSendContract(contract.id)} loading={submitting}>Send Contract</Button>
                              )}
                              {contract.contract_status === 'sent' && userRole === 'organizer' && (
                                <Button onClick={() => onSignOrganizer(contract.id)} loading={submitting}>Sign as Organizer</Button>
                              )}
                              {contract.contract_status === 'organizer_signed' && userRole === 'vendor' && (
                                <Button onClick={() => onSignVendor(contract.id)} loading={submitting}>Sign as Vendor</Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-3">No contract found for this booking.</p>
                            {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                              <Button onClick={() => { setCreateBookingId(booking.id); setShowCreateModal(true) }}>Create Contract</Button>
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
        </div>
      )}

      {activeTab === 'contracts' && (
        <div>
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.vendorName || 'Unknown Vendor'}</p>
                    <p className="text-sm text-gray-500">{c.category}</p>
                  </div>
                  <StatusBadge status={c.contract_status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No contracts" description="Contracts will appear once bookings are accepted." />
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div>
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{item.vendorName || 'System'}</span>
                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Status changed from <span className="font-medium">{item.previous_status || 'none'}</span>
                        {' '}to <StatusBadge status={item.new_status} size="sm" />
                      </p>
                      {item.reason && <p className="text-xs text-gray-500 mt-1">Reason: {item.reason}</p>}
                      {item.category && <p className="text-xs text-gray-400 mt-1">Category: {item.category}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity" description="Activity will appear as bookings and contracts progress." />
          )}
        </div>
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


