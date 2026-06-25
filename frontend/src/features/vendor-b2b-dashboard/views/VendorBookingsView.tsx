import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Music4, Camera, ShieldCheck, Truck, LayoutPanelTop, Mail, Wallet } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ContractTimeline, buildContractTimeline } from '../../contract-booking/components/ContractTimeline'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { AuditTimeline } from '../../../shared/components/AuditTimeline'
import { BookingMessageThread } from '../../../shared/components/CommunicationComponents'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import { Modal } from '../../../shared/components/Modal'
import { B2B_TABS } from '../models/vendor-b2b-dashboard.model'
import type { BookingRequest } from '../../../services/bookingService'
import type { ContractDetail } from '../../../services/contractService'
import type { AuditActivity } from '../../../services/auditService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'
import type { BookingMessage } from '../../../services/communicationService'

interface VendorBookingsViewProps {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: string
  loading: boolean
  submitting: boolean
  error: string | null
  contract: ContractDetail | null
  contractLoading: boolean
  auditActivities: AuditActivity[]
  bookingMessages: BookingMessage[]
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onRefreshRealtime: () => Promise<void>
  onLoadBookings: (status?: string) => Promise<void>
  onSetTab: (tab: string) => void
  onSelectBooking: (bookingId: string) => Promise<void>
  onUpdateStatus: (bookingId: string, status: 'accepted' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>
  onClearError: () => void
  onLoadContract: (bookingId: string) => Promise<void>
  onSignVendorContract: (contractId: string) => Promise<void>
  onSendBookingMessage: (body: string) => Promise<void>
  userRole?: string | null
}

interface RequestCard {
  title: string
  organizer: string
  budget: number | null
  eventDate: string
  venue: string
  guests: number
  category: string
  booking: BookingRequest
}

const bookingIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Catering: CalendarDays,
  'Lights and sounds': Music4,
  Photography: Camera,
  Security: ShieldCheck,
  Transportation: Truck,
  'Stage production': LayoutPanelTop
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function BookingChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function VendorBookingsView({
  bookings,
  selectedBooking,
  activeTab,
  loading,
  submitting,
  error,
  contract,
  contractLoading,
  auditActivities,
  bookingMessages,
  realtimeSnapshot,
  realtimeRefreshing,
  onRefreshRealtime,
  onLoadBookings,
  onSetTab,
  onSelectBooking,
  onUpdateStatus,
  onClearError,
  onLoadContract,
  onSignVendorContract,
  onSendBookingMessage,
  userRole,
}: VendorBookingsViewProps) {
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null)
  const [negotiateOpen, setNegotiateOpen] = useState(false)
  const [negotiationReason, setNegotiationReason] = useState('')

  const requestCards = useMemo<RequestCard[]>(() => bookings.map((booking) => ({
    title: booking.large_events?.title || 'Organizer request',
    organizer: booking.organizer_profiles?.organization_name || 'Organizer',
    budget: booking.requested_budget,
    eventDate: booking.large_events?.event_date || booking.requested_at,
    venue: booking.large_events?.venue || 'Venue pending',
    guests: booking.large_events?.expected_guests || 0,
    category: booking.event_requirements?.category || booking.booking_type || 'Request',
    booking
  })), [bookings])

  const handleDecline = async () => {
    if (confirmDecline) {
      await onUpdateStatus(confirmDecline, 'rejected')
      setConfirmDecline(null)
    }
  }

  const handleNegotiate = async () => {
    if (!selectedBooking) return
    const reason = negotiationReason.trim()
    if (!reason) return
    await onUpdateStatus(selectedBooking.id, 'changes_requested', reason)
    setNegotiateOpen(false)
    setNegotiationReason('')
  }

  const selectedCategory = selectedBooking?.event_requirements?.category || selectedBooking?.booking_type || 'Booking'
  const SelectedIcon = bookingIconMap[selectedCategory] ?? CalendarDays
  const selectedRequirement = selectedBooking?.event_requirements

  return (
    <DashboardShell>
      <ConfirmDialog
        open={!!confirmDecline}
        title="Decline booking request"
        message="Declining will remove this request from the active response queue."
        confirmLabel="Decline"
        variant="danger"
        loading={submitting}
        onConfirm={handleDecline}
        onCancel={() => setConfirmDecline(null)}
      />

      <Modal
        open={negotiateOpen}
        onClose={() => {
          setNegotiateOpen(false)
          setNegotiationReason('')
        }}
        title="Request negotiation"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Add a short message describing what you want to negotiate. This will be sent to the organizer and saved in the request record.
          </p>
          <textarea
            value={negotiationReason}
            onChange={(e) => setNegotiationReason(e.target.value)}
            placeholder="Example: Can we reduce the budget slightly or adjust the service scope?"
            className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => {
              setNegotiateOpen(false)
              setNegotiationReason('')
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleNegotiate()}
              loading={submitting}
              disabled={!negotiationReason.trim()}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      <div className="space-y-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Bookings & Requests"
            subtitle="Manage your incoming B2B requests and confirmed event contracts."
          />
          <RealtimeIndicator
            snapshot={realtimeSnapshot}
            refreshing={realtimeRefreshing || loading}
            onRefresh={() => {
              void onRefreshRealtime()
              void onLoadBookings(activeTab === 'all' ? undefined : activeTab)
            }}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-700">Dismiss</button>
          </div>
        )}

        <div className="mt-4 flex gap-6 overflow-x-auto border-b border-slate-100 pb-px">
          {B2B_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSetTab(tab.key)}
              className={`whitespace-nowrap pb-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.key
                  ? 'text-brand-600'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
          <section className="flex flex-col gap-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-[24px] bg-slate-100" />
                ))}
              </div>
            ) : requestCards.length === 0 ? (
              <EmptyState
                title="No B2B bookings"
                description="Organizer booking requests will appear here when procurement starts."
              />
            ) : (
              <div className="grid gap-4">
                {requestCards.map((card) => {
                  const isSelected = selectedBooking?.id === card.booking.id
                  return (
                    <div
                      key={card.booking.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectBooking(card.booking.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectBooking(card.booking.id) } }}
                      className={`overflow-hidden rounded-[24px] border text-left transition-all duration-300 ${
                        isSelected 
                          ? 'border-brand-300 bg-brand-50 shadow-md ring-4 ring-brand-500/10' 
                          : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className={`text-base font-bold ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>{card.title}</h3>
                            <p className="mt-1 text-sm text-slate-500 font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              {card.organizer}
                            </p>
                          </div>
                          <StatusBadge status={card.booking.status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <BookingChip label="Date" value={formatDate(card.eventDate)} />
                          <BookingChip label="Budget" value={card.budget ? `$${card.budget.toLocaleString()}` : 'N/A'} />
                        </div>
                        {isSelected && (card.booking.status === 'pending' || card.booking.status === 'sent' || card.booking.status === 'viewed') && (
                          <div className="grid gap-2 sm:grid-cols-3 pt-1">
                            <Button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                void onUpdateStatus(card.booking.id, 'accepted')
                              }}
                              loading={submitting}
                              className="w-full"
                            >
                              Accept
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                setNegotiateOpen(true)
                                setNegotiationReason('')
                              }}
                              loading={submitting}
                              className="w-full"
                            >
                              Negotiate
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                setConfirmDecline(card.booking.id)
                              }}
                              loading={submitting}
                              className="w-full"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="sticky top-24 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {selectedBooking ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100">
                      <SelectedIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedBooking.large_events?.title || 'Event'}</h3>
                      <p className="text-slate-500 font-medium">{selectedBooking.organizer_profiles?.organization_name}</p>
                    </div>
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <BookingChip label="Service Required" value={selectedCategory} />
                  <BookingChip label="Event Date" value={selectedBooking.large_events?.event_date ? formatDate(selectedBooking.large_events.event_date) : 'N/A'} />
                  <BookingChip label="Venue" value={selectedBooking.large_events?.venue || 'N/A'} />
                  <BookingChip label="Expected Guests" value={selectedBooking.large_events?.expected_guests ? selectedBooking.large_events.expected_guests.toLocaleString() : 'N/A'} />
                </div>

                <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h4 className="font-bold text-slate-900">Organizer Requirements</h4>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      {selectedRequirement?.quantity ? `${selectedRequirement.quantity} needed` : 'Requirement'}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <BookingChip label="Category" value={selectedRequirement?.category || selectedCategory} />
                    <BookingChip label="Minimum Budget" value={selectedRequirement?.min_budget ? `$${Number(selectedRequirement.min_budget).toLocaleString()}` : 'Not set'} />
                    <BookingChip label="Maximum Budget" value={selectedRequirement?.max_budget ? `$${Number(selectedRequirement.max_budget).toLocaleString()}` : 'Not set'} />
                    <BookingChip label="Requirement Status" value={selectedRequirement?.requirement_status || 'open'} />
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Requirement Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedRequirement?.notes || selectedBooking.notes || 'No additional notes provided.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Proposed Budget</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-900">
                      {selectedBooking.requested_budget ? `$${Number(selectedBooking.requested_budget).toLocaleString()}` : 'Negotiable'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-brand-100 bg-brand-50/40 p-5">
                  <div className="mb-4">
                    <h4 className="font-bold text-slate-900">Respond to Request</h4>
                    <p className="text-sm text-slate-500 mt-1">Accept, negotiate, or reject this booking request.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Button onClick={() => onUpdateStatus(selectedBooking.id, 'accepted')} loading={submitting} className="w-full">
                      Accept
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setNegotiateOpen(true)
                      setNegotiationReason('')
                    }} loading={submitting} className="w-full">
                      Negotiate
                    </Button>
                    <Button variant="danger" onClick={() => setConfirmDecline(selectedBooking.id)} loading={submitting} className="w-full">
                      Reject
                    </Button>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Organizer Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="rounded-[24px] border border-slate-100 bg-slate-50/30 p-6">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <h4 className="font-bold text-slate-900">Contract Status</h4>
                    <Button variant="ghost" onClick={() => onLoadContract(selectedBooking.id)} className="text-brand-600 hover:text-brand-700">
                      {contract ? 'Refresh' : 'View contract'}
                    </Button>
                  </div>
                  {contractLoading ? (
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  ) : contract ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-semibold text-slate-700">
                          {contract.contract_number ? `Ref: #${contract.contract_number}` : 'Standard Contract'}
                        </p>
                        <StatusBadge status={contract.contract_status} size="sm" />
                      </div>
                      {contract.terms_summary && <p className="text-sm text-slate-600 leading-relaxed">{contract.terms_summary}</p>}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100">
                        <ContractTimeline steps={buildContractTimeline(contract)} />
                      </div>
                      {contract.contract_status === 'organizer_signed' && (
                        <Button onClick={() => onSignVendorContract(contract.id)} loading={submitting} fullWidth>
                          Sign Contract
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">No Contract Issued</p>
                      <p className="text-sm text-slate-500 mt-1">The organizer will prepare the contract once terms are agreed.</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4">Messages</h4>
                    <BookingMessageThread messages={bookingMessages} onSendMessage={onSendBookingMessage} userRole={userRole} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4">Audit Trail</h4>
                    <AuditTimeline activities={auditActivities} emptyText="No activity recorded yet." />
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-6">
                  <Wallet className="w-8 h-8 text-brand-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Request</h3>
                <p className="text-slate-500 max-w-sm">Choose a booking from the queue to review organizer details, contract status, and communication.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
