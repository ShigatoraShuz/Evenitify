import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarDays, Mail, Music4, Camera, ShieldCheck, Truck, LayoutPanelTop, TrendingUp, Users } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { DashboardCommandPanel } from '../../../shared/components/DashboardCommandPanel'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import type { BookingRequest } from '../../../services/bookingService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'

interface VendorB2BDashboardViewProps {
  bookings: BookingRequest[]
  loading: boolean
  error: string | null
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadBookings: () => Promise<void>
  onRefreshRealtime: () => Promise<void>
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

export function VendorB2BDashboardView({
  bookings,
  loading,
  error,
  realtimeSnapshot,
  realtimeRefreshing,
  onLoadBookings,
  onRefreshRealtime,
  onClearError,
}: VendorB2BDashboardViewProps) {
  const navigate = useNavigate()

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

  return (
    <DashboardShell>
      <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Vendor Overview"
            subtitle="Your high-level command center for B2B operations."
          />
          <RealtimeIndicator
            snapshot={realtimeSnapshot}
            refreshing={realtimeRefreshing || loading}
            onRefresh={() => {
              void onRefreshRealtime()
              void onLoadBookings()
            }}
          />
        </div>

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
            {largeEventOpportunities.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="ghost" onClick={() => navigate('/vendor/bookings')} className="text-brand-600">
                  View all in Bookings <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Upcoming Confirmed</h2>
            <p className="text-sm text-slate-500 mb-6">Events locked in your schedule.</p>
            
            <div className="grid gap-4">
              {upcomingConfirmed.length > 0 ? upcomingConfirmed.map((card) => (
                <div key={card.booking.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{card.title}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">{formatDate(card.eventDate)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No confirmed events yet</p>
                </div>
              )}
            </div>
            <div className="mt-6">
               <Button variant="secondary" onClick={() => navigate('/vendor/availability')} fullWidth>
                 Check Availability Calendar
               </Button>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
