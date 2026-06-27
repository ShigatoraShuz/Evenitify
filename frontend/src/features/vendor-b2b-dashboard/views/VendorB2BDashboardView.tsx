import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ShieldCheck,
  Truck,
  Music4,
  Camera,
  LayoutPanelTop,
  Building2,
  User as UserIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { Modal } from '../../../shared/components/Modal'
import { Input } from '../../../shared/components/Input'
import { ContractTimeline, buildContractTimeline } from '../../contract-booking/components/ContractTimeline'
import { B2B_TABS, REQUEST_TYPE_TABS, getRequestTypeFromGuests, getRequestTypeLabel } from '../models/vendor-b2b-dashboard.model'
import type { BookingRequest } from '../../../services/bookingService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'
import type { RequestType } from '../models/vendor-b2b-dashboard.model'

interface VendorB2BDashboardViewProps {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: string
  activeTypeTab: RequestType
  loading: boolean
  submitting: boolean
  error: string | null
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadBookings: (status?: string, type?: string) => Promise<void>
  onRefreshRealtime: () => Promise<void>
  onSetTab: (tab: string) => void
  onSetTypeTab: (tab: RequestType) => void
  onSelectBooking: (bookingId: string) => Promise<void>
  onUpdateStatus: (bookingId: string, status: 'accepted' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>
  onSubmitQuote: (bookingId: string, payload: { price: number; notes?: string | null; validUntil?: string | null }) => Promise<void>
  onClearError: () => void
}

interface RequestCard {
  title: string
  organizer: string
  budget: number | null
  eventDate: string
  venue: string
  guests: number
  category: string
  requestedServices: Array<{
    id: string
    serviceName: string
    category: string | null
  }>
  booking: BookingRequest
}

const bookingIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Catering: CalendarDays,
  'Lights and sounds': Music4,
  Photography: Camera,
  Security: ShieldCheck,
  Transportation: Truck,
  'Stage production': LayoutPanelTop,
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function BookingChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-100 px-2.5 py-1.5 text-[11px] leading-4">
      <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="mt-0.5 block truncate font-semibold text-slate-900">{value}</span>
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
}: VendorB2BDashboardViewProps) {
  const navigate = useNavigate()
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null)
  const [quoteModal, setQuoteModal] = useState<string | null>(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')

  useEffect(() => {
    void onLoadBookings()
  }, [onLoadBookings])

  const requestCards = useMemo<RequestCard[]>(
    () =>
      bookings.map((booking) => ({
        title: booking.large_events?.title || 'Organizer request',
        organizer: booking.organizer_profiles?.organization_name || 'Organizer',
        budget: booking.requested_budget,
        eventDate: booking.large_events?.event_date || booking.requested_at,
        venue: booking.large_events?.venue || 'Venue pending',
        guests: booking.large_events?.expected_guests || 0,
        category: booking.event_requirements?.category || booking.booking_type || 'Request',
        requestedServices: booking.requestedServices || [],
        booking,
      })),
    [bookings]
  )

  const largeEventOpportunities = useMemo(
    () => requestCards.filter((card) => card.guests >= 500 || (card.budget ?? 0) >= 25000).slice(0, 4),
    [requestCards]
  )

  const revenueSummary = useMemo(() => {
    const requested = bookings.reduce((total, booking) => total + (Number(booking.requested_budget) || 0), 0)
    return {
      requested,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      accepted: bookings.filter((booking) => booking.status === 'accepted').length,
    }
  }, [bookings])

  if (error === 'Vendor profile not found' || error === 'VENDOR_NOT_FOUND') {
    return (
      <DashboardShell>
        <PageHeader title="Vendor Overview" subtitle="Welcome to your clean, dedicated workspace." />
        <div className="mx-auto mt-12 max-w-2xl">
          <EmptyState
            title="Vendor Profile Required"
            description="You need to complete your vendor profile to unlock the dashboard, manage services, and receive bookings."
            mediaTitle="Dashboard Locked"
            mediaSubtitle="Profile setup incomplete."
            action={<Button onClick={() => { window.location.href = '/onboarding' }}>Complete Onboarding</Button>}
          />
        </div>
      </DashboardShell>
    )
  }

  const handleSubmitQuote = async () => {
    const bookingId = quoteModal
    if (!bookingId || !quotePrice) return
    await onSubmitQuote(bookingId, {
      price: parseFloat(quotePrice),
      notes: quoteNotes || null,
      validUntil: null,
    })
    setQuoteModal(null)
    setQuotePrice('')
    setQuoteNotes('')
  }

  const getRequestTypeBadge = (booking: BookingRequest) => {
    const requestType = getRequestTypeFromGuests(booking.large_events?.expected_guests)
    const isLargeEvent = requestType === 'large_event'
    const isMicroEvent = requestType === 'personal'
    const label = getRequestTypeLabel(booking.large_events?.expected_guests)
    const Icon = isLargeEvent ? Building2 : isMicroEvent ? UserIcon : Users
    const toneClasses = isLargeEvent
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : isMicroEvent
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-50 text-slate-600'
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClasses}`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
    )
  }

  const selectedCategory = selectedBooking?.event_requirements?.category || selectedBooking?.booking_type || 'Booking'
  const SelectedIcon = bookingIconMap[selectedCategory] ?? CalendarDays

  const handleDecline = () => {
    if (!confirmDecline) return
    onUpdateStatus(confirmDecline, 'rejected')
    setConfirmDecline(null)
  }

  const realtimeStatusLabel = realtimeSnapshot?.connected ? 'Realtime ready' : 'Offline'
  const realtimeUpdatedLabel = realtimeSnapshot?.lastUpdatedAt
    ? new Date(realtimeSnapshot.lastUpdatedAt).toLocaleTimeString()
    : 'Not synced'
  const refreshDashboard = () => {
    void onRefreshRealtime()
    void onLoadBookings(activeTab === 'all' ? undefined : activeTab)
  }

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
        onClose={() => {
          setQuoteModal(null)
          setQuotePrice('')
          setQuoteNotes('')
        }}
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={3}
              placeholder="Describe your quote..."
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setQuoteModal(null)
                setQuotePrice('')
                setQuoteNotes('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitQuote} loading={submitting} disabled={!quotePrice || parseFloat(quotePrice) <= 0}>
              Submit Quote
            </Button>
          </div>
        </div>
      </Modal>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="grid gap-2.5 p-3 xl:grid-cols-[minmax(0,1fr)_minmax(400px,440px)] xl:items-start xl:p-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-600">Eventify</p>
              <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 max-w-3xl">
                  <h1 className="text-[1.65rem] font-semibold tracking-tight text-slate-950 md:text-[1.95rem]">Vendor Dashboard</h1>
                  <p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-500">
                    Separate organizer booking requests from other bookings and manage your B2B event queue with clarity.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => navigate('/vendor/profile')} className="!px-3.5 !py-2">
                    Manage services
                  </Button>
                  <Button onClick={() => navigate('/vendor/reports')} className="!px-3.5 !py-2">
                    View reports
                  </Button>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium',
                    realtimeSnapshot?.connected
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500',
                  ].join(' ')}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${realtimeSnapshot?.connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {realtimeStatusLabel}
                </span>
                <span>Updated {realtimeUpdatedLabel}</span>
                <button
                  type="button"
                  onClick={refreshDashboard}
                  className="rounded-md px-2 py-0.5 font-medium text-brand-600 hover:bg-brand-50 disabled:text-slate-400"
                  disabled={realtimeRefreshing || loading}
                >
                  {realtimeRefreshing || loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="w-full self-start justify-self-stretch rounded-[22px] border border-slate-100 bg-slate-50/70 p-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Snapshot</p>
                  <h2 className="mt-0.5 text-base font-bold text-slate-950">Live overview</h2>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                  {bookings.length} requests
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <div className="flex min-h-[88px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-2">
                  <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-slate-500">
                    <div className="rounded-lg bg-slate-50 p-1">
                      <Users className="h-3 w-3" />
                    </div>
                    <span className="min-w-0 truncate text-[8px] font-bold uppercase tracking-[0.16em]">Requests</span>
                  </div>
                  <p className="text-[1.15rem] font-bold leading-none tabular-nums text-slate-900">{bookings.length}</p>
                </div>

                <div className="flex min-h-[88px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-emerald-400 bg-gradient-to-br from-emerald-500 to-emerald-700 p-2 text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)]">
                  <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-emerald-100">
                    <div className="rounded-lg bg-white/20 p-1 backdrop-blur-sm">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <span className="min-w-0 truncate text-[8px] font-bold uppercase tracking-[0.16em]">Pipeline</span>
                  </div>
                  <p className="text-[1.15rem] font-bold leading-none tabular-nums">${revenueSummary.requested.toLocaleString()}</p>
                  <p className="mt-1 text-[9px] leading-4 text-emerald-50/80">Projected request value</p>
                </div>

                <div className="flex min-h-[88px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-2">
                  <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-slate-500">
                    <div className="rounded-lg bg-indigo-50 p-1 text-indigo-600">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                    <span className="min-w-0 truncate text-[8px] font-bold uppercase tracking-[0.16em]">Accepted</span>
                  </div>
                  <p className="text-[1.15rem] font-bold leading-none tabular-nums text-slate-900">{revenueSummary.accepted}</p>
                </div>

                <div className="flex min-h-[88px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-2">
                  <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-slate-500">
                    <div className="rounded-lg bg-amber-50 p-1 text-amber-600">
                      <BadgeCheck className="h-3 w-3" />
                    </div>
                    <span className="min-w-0 truncate text-[8px] font-bold uppercase tracking-[0.16em]">Confirmed</span>
                  </div>
                  <p className="text-[1.15rem] font-bold leading-none tabular-nums text-slate-900">{revenueSummary.confirmed}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="font-medium text-rose-500 hover:text-rose-700">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <BadgeCheck className="h-5 w-5 text-brand-600" /> Large event opportunities
                </h2>
                <p className="mt-1 text-xs text-slate-500">High-value requests demanding your attention.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {largeEventOpportunities.length > 0 ? (
                largeEventOpportunities.map((card) => {
                  const Icon = bookingIconMap[card.category] ?? CalendarDays
                  return (
                    <button
                      key={card.booking.id}
                      type="button"
                      onClick={() => navigate('/vendor/bookings')}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-left transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-transform group-hover:scale-110">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-bold text-slate-900">{card.title}</h3>
                            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                              {card.organizer} - {card.category}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={card.booking.status} size="sm" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-white/70 px-2.5 py-2">
                          <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">Budget</span>
                          <span className="mt-0.5 block font-semibold text-slate-900">
                            {card.budget ? `$${card.budget.toLocaleString()}` : 'N/A'}
                          </span>
                        </div>
                        <div className="rounded-xl bg-white/70 px-2.5 py-2">
                          <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">Date</span>
                          <span className="mt-0.5 block font-semibold text-slate-900">{formatDate(card.eventDate)}</span>
                        </div>
                      </div>
                      {card.requestedServices.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {card.requestedServices.map((service) => (
                            <span
                              key={service.id}
                              className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700"
                            >
                              {service.serviceName}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })
              ) : (
                <EmptyState
                  title="No large-event opportunities"
                  description="They will appear here once matching your services."
                />
              )}
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

            <div className="mt-4 max-h-[860px] overflow-y-auto pr-1">
              {loading ? (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-[220px] animate-pulse rounded-[22px] border border-slate-100 bg-slate-100" />
                  ))}
                </div>
              ) : requestCards.length === 0 ? (
                <EmptyState
                  title="No B2B bookings"
                  description="Organizer booking requests will appear here when procurement starts."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {requestCards.map((card) => {
                    const Icon = bookingIconMap[card.category] ?? CalendarDays
                    return (
                      <button
                        key={card.booking.id}
                        type="button"
                        onClick={() => onSelectBooking(card.booking.id)}
                        className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3.5 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-transform group-hover:scale-105">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-slate-950">{card.title}</h3>
                              <p className="mt-0.5 truncate text-[12px] text-slate-500">
                                {card.organizer} - {card.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            {getRequestTypeBadge(card.booking)}
                            <StatusBadge status={card.booking.status} size="sm" />
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-3.5">
                          <div className="grid grid-cols-2 gap-2">
                            <BookingChip label="Budget" value={card.budget ? `$${card.budget.toLocaleString()}` : 'N/A'} />
                            <BookingChip label="Date" value={formatDate(card.eventDate)} />
                            <BookingChip label="Venue" value={card.venue} />
                            <BookingChip label="Guests" value={card.guests ? card.guests.toLocaleString() : 'N/A'} />
                          </div>
                          {card.requestedServices.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {card.requestedServices.slice(0, 4).map((service) => (
                                <span
                                  key={service.id}
                                  className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700"
                                >
                                  {service.serviceName}
                                </span>
                              ))}
                              {card.requestedServices.length > 4 && (
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  +{card.requestedServices.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                            Open
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </DashboardShell>
  )
}
