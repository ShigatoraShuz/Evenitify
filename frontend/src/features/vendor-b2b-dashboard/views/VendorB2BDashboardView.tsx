import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarDays, Mail, ShieldCheck, Truck, Wallet, Music4, Camera, LayoutPanelTop, Building2, User as UserIcon } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { Modal } from '../../../shared/components/Modal'
import { Input } from '../../../shared/components/Input'
import { ContractTimeline, buildContractTimeline } from '../../contract-booking/components/ContractTimeline'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { AuditTimeline } from '../../../shared/components/AuditTimeline'
import { DashboardCommandPanel } from '../../../shared/components/DashboardCommandPanel'
import { AvailabilityCalendar, AvailabilityQuickUpdate, BlockedDateList } from '../../../shared/components/AvailabilityComponents'
import { BookingMessageThread } from '../../../shared/components/CommunicationComponents'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import { B2B_TABS, REQUEST_TYPE_TABS } from '../models/vendor-b2b-dashboard.model'
import type { BookingRequest } from '../../../services/bookingService'
import type { ContractDetail } from '../../../services/contractService'
import type { AuditActivity } from '../../../services/auditService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'
import type { AvailabilityStatus, VendorAvailabilityPreview } from '../../../services/availabilityService'
import type { BookingMessage } from '../../../services/communicationService'
import type { RequestType } from '../models/vendor-b2b-dashboard.model'

interface VendorB2BDashboardViewProps {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: string
  activeTypeTab: RequestType
  loading: boolean
  submitting: boolean
  error: string | null
  contract: ContractDetail | null
  contractLoading: boolean
  auditActivities: AuditActivity[]
  availability: VendorAvailabilityPreview | null
  bookingMessages: BookingMessage[]
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadBookings: (status?: string) => Promise<void>
  onRefreshRealtime: () => Promise<void>
  onSetTab: (tab: string) => void
  onSetTypeTab: (tab: RequestType) => void
  onSelectBooking: (bookingId: string) => Promise<void>
  onUpdateStatus: (bookingId: string, status: 'accepted' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>
  onSubmitQuote: (bookingId: string, payload: { price: number; notes?: string | null; validUntil?: string | null }) => Promise<void>
  onClearError: () => void
  onLoadContract: (bookingId: string) => Promise<void>
  onSignVendorContract: (contractId: string) => Promise<void>
  onUpdateAvailabilityStatus: (status: AvailabilityStatus) => Promise<void>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}

export function VendorB2BDashboardView({
  bookings,
  selectedBooking,
  activeTab,
  activeTypeTab,
  loading,
  submitting,
  error,
  contract,
  contractLoading,
  auditActivities,
  availability,
  bookingMessages,
  realtimeSnapshot,
  realtimeRefreshing,
  onLoadBookings,
  onRefreshRealtime,
  onSetTab,
  onSetTypeTab,
  onSelectBooking,
  onUpdateStatus,
  onSubmitQuote,
  onClearError,
  onLoadContract,
  onSignVendorContract,
  onUpdateAvailabilityStatus
}: VendorB2BDashboardViewProps) {
  const navigate = useNavigate()
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null)
  const [quoteModal, setQuoteModal] = useState<string | null>(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')

  useEffect(() => {
    void onLoadBookings()
  }, [onLoadBookings])

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

  const largeEventOpportunities = useMemo(
    () => requestCards.filter((card) => (card.guests >= 500) || (card.budget ?? 0) >= 25000).slice(0, 3),
    [requestCards]
  )

  const revenueSummary = useMemo(() => {
    const requested = bookings.reduce((total, booking) => total + (Number(booking.requested_budget) || 0), 0)
    return {
      requested,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      accepted: bookings.filter((booking) => booking.status === 'accepted').length
    }
  }, [bookings])

  const handleDecline = async () => {
    if (confirmDecline) {
      await onUpdateStatus(confirmDecline, 'rejected')
      setConfirmDecline(null)
    }
  }

  const handleSubmitQuote = async () => {
    const bookingId = quoteModal
    if (!bookingId || !quotePrice) return
    await onSubmitQuote(bookingId, {
      price: parseFloat(quotePrice),
      notes: quoteNotes || null,
      validUntil: null
    })
    setQuoteModal(null)
    setQuotePrice('')
    setQuoteNotes('')
  }

  const getRequestTypeBadge = (booking: BookingRequest) => {
    const isPersonal = booking.booking_type === 'PERSONAL'
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isPersonal
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}>
        {isPersonal ? <UserIcon className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
        {isPersonal ? 'Personal' : 'Large Event'}
      </span>
    )
  }

  const selectedCategory = selectedBooking?.event_requirements?.category || selectedBooking?.booking_type || 'Booking'
  const SelectedIcon = bookingIconMap[selectedCategory] ?? CalendarDays

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
        open={!!quoteModal}
        title="Submit Quote"
        onClose={() => { setQuoteModal(null); setQuotePrice(''); setQuoteNotes('') }}
      >
        <div className="space-y-4">
          <Input
            label="Price ($)"
            type="number"
            placeholder="0.00"
            value={quotePrice}
            onChange={(e) => setQuotePrice(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={3}
              placeholder="Describe your quote..."
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setQuoteModal(null); setQuotePrice(''); setQuoteNotes('') }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuote} loading={submitting} disabled={!quotePrice || parseFloat(quotePrice) <= 0}>
              Submit Quote
            </Button>
          </div>
        </div>
      </Modal>

      <div className="space-y-6">
        <PageHeader
          title="Vendor Dashboard"
          subtitle="Separate organizer booking requests from other bookings and manage your B2B event queue with clarity."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => navigate('/vendor/profile')}>
                Manage services
              </Button>
              <Button onClick={() => navigate('/vendor/reports')}>
                View reports
              </Button>
            </div>
          }
        />

        <RealtimeIndicator
          snapshot={realtimeSnapshot}
          refreshing={realtimeRefreshing || loading}
          onRefresh={() => {
            void onRefreshRealtime()
            void onLoadBookings(activeTab === 'all' ? undefined : activeTab)
          }}
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-700">Dismiss</button>
          </div>
        )}

        <DashboardCommandPanel
          meta="B2B request queue"
          title="Respond to organizer and large-event bookings"
          description="The active queue stays separate from consumer work so you can prioritize high-value procurement requests first."
          action={
            <>
              <Button onClick={() => onSetTab('pending')}>Review pending</Button>
              <Button variant="secondary" onClick={() => navigate('/vendor/profile')}>
                Update availability
              </Button>
            </>
          }
          secondary={
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending requests</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{revenueSummary.pending}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Accepted bookings</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{revenueSummary.accepted}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Confirmed events</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{revenueSummary.confirmed}</p>
              </div>
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <AvailabilityCalendar preview={availability} />
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950 p-2 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">Service availability</h3>
                <p className="text-sm text-slate-500">Keep your calendar and blocked dates in sync before accepting organizer work.</p>
              </div>
            </div>
            <div className="mt-4">
              <AvailabilityQuickUpdate
                status={availability?.status || 'available'}
                updating={submitting}
                onUpdate={(status) => { void onUpdateAvailabilityStatus(status) }}
              />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-950">Blocked dates</h4>
              <BlockedDateList dates={availability?.blockedDates || []} />
            </div>
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total requests" value={bookings.length} color="text-slate-950" sub="All organizer and B2B bookings" />
          <SummaryCard label="Requested value" value={`$${revenueSummary.requested.toLocaleString()}`} color="text-emerald-700" sub="Combined budget across active requests" />
          <SummaryCard label="Accepted" value={bookings.filter((b) => b.status === 'accepted').length} color="text-indigo-700" sub="Requests you have accepted" />
          <SummaryCard label="Confirmed" value={revenueSummary.confirmed} color="text-amber-700" sub="Events locked in your calendar" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Large event opportunities</h2>
                <p className="text-sm text-slate-500">Highlighted requests with bigger budgets or guest counts.</p>
              </div>
              <BadgeCheck className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-4 grid gap-3">
              {largeEventOpportunities.length > 0 ? largeEventOpportunities.map((card) => {
                const Icon = bookingIconMap[card.category] ?? CalendarDays
                return (
                  <button
                    key={card.booking.id}
                    type="button"
                    onClick={() => onSelectBooking(card.booking.id)}
                    className="group rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-white bg-white p-2 text-slate-700 shadow-sm">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-950">{card.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{card.organizer} · {card.category}</p>
                        </div>
                      </div>
                      <StatusBadge status={card.booking.status} size="sm" />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
                      <BookingChip label="Budget" value={card.budget ? `$${card.budget.toLocaleString()}` : 'N/A'} />
                      <BookingChip label="Date" value={formatDate(card.eventDate)} />
                      <BookingChip label="Guests" value={card.guests ? card.guests.toLocaleString() : 'N/A'} />
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                      Review request
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                )
              }) : (
                <EmptyState
                  title="No large-event opportunities yet"
                  description="Organizer requests will show up here once they match your services and availability."
                />
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Confirmed event snapshot</h2>
                <p className="text-sm text-slate-500">A quick view of the work you have already won.</p>
              </div>
              <Wallet className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4">
              <PlaceholderMedia
                title={selectedBooking?.large_events?.title || 'Confirmed booking'}
                subtitle={selectedBooking ? `${selectedBooking.organizer_profiles?.organization_name || 'Organizer'} · ${selectedCategory}` : 'Select a booking to inspect the event in detail.'}
                tone={selectedBooking?.status === 'confirmed' ? 'emerald' : 'indigo'}
                icon={<SelectedIcon className="h-5 w-5" />}
              />
            </div>

            {selectedBooking ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{selectedBooking.large_events?.title || 'Event'}</h3>
                    <p className="text-sm text-slate-500">{selectedBooking.organizer_profiles?.organization_name}</p>
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <BookingChip label="Organizer" value={selectedBooking.organizer_profiles?.organization_name || 'N/A'} />
                  <BookingChip label="Service" value={selectedCategory} />
                  <BookingChip label="Date" value={selectedBooking.large_events?.event_date ? formatDate(selectedBooking.large_events.event_date) : 'N/A'} />
                  <BookingChip label="Venue" value={selectedBooking.large_events?.venue || 'N/A'} />
                  <BookingChip label="Guests" value={selectedBooking.large_events?.expected_guests ? selectedBooking.large_events.expected_guests.toLocaleString() : 'N/A'} />
                  <BookingChip label="Budget" value={selectedBooking.requested_budget ? `$${Number(selectedBooking.requested_budget).toLocaleString()}` : 'N/A'} />
                </div>

                {selectedBooking.notes && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">Notes:</span> {selectedBooking.notes}
                  </div>
                )}

                {selectedBooking.status === 'pending' && (
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => onUpdateStatus(selectedBooking.id, 'accepted')} loading={submitting}>
                      Accept
                    </Button>
                    <Button variant="secondary" onClick={() => setQuoteModal(selectedBooking.id)} loading={submitting}>
                      Submit Quote
                    </Button>
                    <Button variant="secondary" onClick={() => onUpdateStatus(selectedBooking.id, 'changes_requested')} loading={submitting}>
                      Request changes
                    </Button>
                    <Button variant="danger" onClick={() => setConfirmDecline(selectedBooking.id)} loading={submitting}>
                      Decline
                    </Button>
                  </div>
                )}

                <div className="rounded-[22px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-slate-950">Contract</h4>
                    <Button variant="ghost" onClick={() => onLoadContract(selectedBooking.id)}>
                      {contract ? 'Refresh' : 'View contract'}
                    </Button>
                  </div>
                  {contractLoading ? (
                    <div className="mt-3 h-20 animate-pulse rounded-2xl bg-slate-100" />
                  ) : contract ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">
                          {contract.contract_number ? `#${contract.contract_number}` : 'Contract'}
                        </p>
                        <StatusBadge status={contract.contract_status} size="sm" />
                      </div>
                      {contract.terms_summary && <p className="text-sm text-slate-600">{contract.terms_summary}</p>}
                      <ContractTimeline steps={buildContractTimeline(contract)} />
                      {contract.contract_status === 'organizer_signed' && (
                        <Button onClick={() => onSignVendorContract(contract.id)} loading={submitting}>
                          Sign as vendor
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No contract yet. It appears after the organizer creates one.</p>
                  )}
                </div>

                <div className="rounded-[22px] border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-950">Messages</h4>
                  <div className="mt-3">
                    <BookingMessageThread messages={bookingMessages} />
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-950">Activity</h4>
                  <div className="mt-3">
                    <AuditTimeline activities={auditActivities} emptyText="No activity for this booking yet." />
                  </div>
                </div>

                <Button variant="ghost" onClick={() => onSelectBooking('')}>
                  Back to request list
                </Button>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Select a request"
                  description="Choose a booking on the left to see organizer details, contract status, and action buttons."
                />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Vendor command line</p>
              <h2 className="mt-2 text-2xl font-semibold">Keep B2B work separate and actionable</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Pending organizer requests, confirmed work, and service availability all live in one calm workspace so you can move faster.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1">Organizer requests</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Large event opportunities</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Confirmed events</span>
              </div>
            </div>
            <PlaceholderMedia
              title="Booking summary"
              subtitle={`${bookings.length} total requests · ${revenueSummary.requested ? `$${revenueSummary.requested.toLocaleString()} requested value` : 'No value yet'}`}
              tone="slate"
              icon={<Mail className="h-5 w-5" />}
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">All bookings</h2>
              <p className="text-sm text-slate-500">Use the tabs to separate pending requests from confirmed B2B work.</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
            {REQUEST_TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSetTypeTab(tab.key)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTypeTab === tab.key
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
            {B2B_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSetTab(tab.key)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[20px] bg-slate-100" />
              ))}
            </div>
          ) : requestCards.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No B2B bookings"
                description="Organizer booking requests will appear here when procurement starts."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {requestCards.map((card) => (
                <button
                  key={card.booking.id}
                  type="button"
                  onClick={() => onSelectBooking(card.booking.id)}
                  className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
                >
                  <PlaceholderMedia
                    title={card.title}
                    subtitle={`${card.organizer} · ${card.category}`}
                    tone={card.booking.status === 'confirmed' ? 'emerald' : 'indigo'}
                    icon={<CalendarDays className="h-5 w-5" />}
                    compact
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 truncate">{card.title}</h3>
                        <p className="mt-1 text-sm text-slate-500 truncate">{card.organizer}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getRequestTypeBadge(card.booking)}
                        <StatusBadge status={card.booking.status} size="sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <BookingChip label="Budget" value={card.budget ? `$${card.budget.toLocaleString()}` : 'N/A'} />
                      <BookingChip label="Date" value={formatDate(card.eventDate)} />
                      <BookingChip label="Venue" value={card.venue} />
                      <BookingChip label="Guests" value={card.guests ? card.guests.toLocaleString() : 'N/A'} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                      Open request
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  )
}
