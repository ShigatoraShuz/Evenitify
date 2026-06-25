import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarDays, Mail, ShieldCheck, Truck, Wallet, Music4, Camera, LayoutPanelTop, Building2, User as UserIcon, TrendingUp, Users } from 'lucide-react'
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
import { DashboardCommandPanel } from '../../../shared/components/DashboardCommandPanel'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import { B2B_TABS, REQUEST_TYPE_TABS } from '../models/vendor-b2b-dashboard.model'
import type { BookingRequest } from '../../../services/bookingService'
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
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadBookings: () => Promise<void>
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
    <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">{label}</span>
      <span className="font-semibold text-slate-900 mt-0.5 block">{value}</span>
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
    () => requestCards.filter((card) => (card.guests >= 500) || (card.budget ?? 0) >= 25000).slice(0, 4),
    [requestCards]
  )

  const upcomingConfirmed = useMemo(
    () => requestCards.filter((card) => card.booking.status === 'confirmed').slice(0, 3),
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

  if (error === 'Vendor profile not found' || error === 'VENDOR_NOT_FOUND') {
    return (
      <DashboardShell>
        <PageHeader title="Vendor Overview" subtitle="Welcome to your clean, dedicated workspace." />
        <div className="mt-12 max-w-2xl mx-auto">
          <EmptyState
            title="Vendor Profile Required"
            description="You need to complete your vendor profile to unlock the dashboard, manage services, and receive bookings."
            mediaTitle="Dashboard Locked"
            mediaSubtitle="Profile setup incomplete."
            action={<Button onClick={() => window.location.href = '/onboarding'}>Complete Onboarding</Button>}
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

  const handleDecline = () => {
    if (!confirmDecline) return
    onUpdateStatus(confirmDecline, 'rejected')
    setConfirmDecline(null)
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
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3 shadow-sm">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-700 font-medium">Dismiss</button>
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 text-slate-500">
              <div className="p-2 bg-slate-50 rounded-xl"><Users className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-widest">Total Requests</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{bookings.length}</p>
          </div>
          
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 shadow-[0_8px_30px_rgb(16,185,129,0.2)] border border-emerald-400 flex flex-col justify-between text-white">
            <div className="flex items-center gap-3 mb-4 text-emerald-100">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><TrendingUp className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-widest">Pipeline Value</span>
            </div>
            <p className="text-4xl font-bold">${revenueSummary.requested.toLocaleString()}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 text-slate-500">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-widest">Accepted</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{bookings.filter((b) => b.status === 'accepted').length}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 text-slate-500">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><BadgeCheck className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-widest">Confirmed</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{revenueSummary.confirmed}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-8 text-slate-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="grid gap-8 lg:grid-cols-[1fr_400px] relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-widest mb-4">
                <Mail className="w-3.5 h-3.5" /> Workspace Ready
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your clean command center</h2>
              <p className="mt-3 max-w-2xl text-base text-slate-600 leading-relaxed">
                We've organized your tools into dedicated pages. Create events, respond to incoming bookings, and adjust your availability from the sidebar navigation.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button onClick={() => navigate('/vendor/bookings')} className="shadow-lg shadow-brand-500/20">Go to Bookings</Button>
                <Button variant="secondary" onClick={() => navigate('/vendor/services')}>Manage Services</Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <PlaceholderMedia
                title="Active Workspace"
                subtitle="Everything is running smoothly."
                tone="indigo"
                icon={<LayoutPanelTop className="h-6 w-6" />}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BadgeCheck className="h-6 w-6 text-brand-600" /> Large event opportunities
                </h2>
                <p className="text-sm text-slate-500 mt-1">High-value requests demanding your attention.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {largeEventOpportunities.length > 0 ? largeEventOpportunities.map((card) => {
                const Icon = bookingIconMap[card.category] ?? CalendarDays
                return (
                  <button
                    key={card.booking.id}
                    type="button"
                    onClick={() => navigate('/vendor/bookings')}
                    className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-left transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                          <p className="text-sm font-medium text-slate-500 mt-0.5">{card.organizer} · {card.category}</p>
                        </div>
                      </div>
                      <StatusBadge status={card.booking.status} size="sm" />
                    </div>
                    <div className="mt-5 flex items-center gap-6 text-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Budget</span>
                        <span className="font-semibold text-slate-900 mt-0.5">{card.budget ? `$${card.budget.toLocaleString()}` : 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date</span>
                        <span className="font-semibold text-slate-900 mt-0.5">{formatDate(card.eventDate)}</span>
                      </div>
                    </div>
                  </button>
                )
              }) : (
                <EmptyState
                  title="No large-event opportunities"
                  description="They will appear here once matching your services."
                />
              )}
            </div>
          </section>
          </div>

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

