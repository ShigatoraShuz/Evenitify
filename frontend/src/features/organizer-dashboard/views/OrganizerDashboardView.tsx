import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, FolderKanban, LayoutGrid, Sparkles, Users, Wallet, MapPin, Clock3, Activity } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { DashboardCommandPanel } from '../../../shared/components/DashboardCommandPanel'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import { EventSetupBuilder } from '../components/EventSetupBuilder'
import type { EventSetupPayload } from '../models/event-setup-builder.model'
import type { LargeEvent, DashboardSummary } from '../../../services/eventService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'

interface OrganizerDashboardViewProps {
  events: LargeEvent[]
  summary: DashboardSummary | null
  loading: boolean
  submitting: boolean
  error: string | null
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadEvents: () => Promise<void>
  onRefreshRealtime: () => Promise<void>
  onCreateEvent: (payload: EventSetupPayload) => Promise<void>
  onSelectEvent: (eventId: string) => void
  onNavigateToPortfolio?: (eventId: string) => void
}

interface ActionCard {
  title: string
  description: string
  label: string
  to: string
  tone: 'brand' | 'emerald' | 'slate'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function OrganizerDashboardView({
  events,
  summary,
  loading,
  submitting,
  error,
  realtimeSnapshot,
  realtimeRefreshing,
  onLoadEvents,
  onRefreshRealtime,
  onCreateEvent,
  onSelectEvent,
  onNavigateToPortfolio
}: OrganizerDashboardViewProps) {
  const navigate = useNavigate()

  useEffect(() => {
    void onLoadEvents()
  }, [onLoadEvents])

  const eventStatusSummary = summary?.eventStatusSummary
  const requirementSummary = summary?.requirementSummary
  const bookingSummary = summary?.bookingSummary
  const actionCards = useMemo((): ActionCard[] => {
    const cards: ActionCard[] = []
    const totalEvents = eventStatusSummary?.total ?? events.length
    const openReqs = requirementSummary?.open ?? 0
    const pendingBookings = bookingSummary?.pending ?? 0
    const contractSent = bookingSummary?.contractSent ?? 0

    if (totalEvents === 0) {
      cards.push({
        title: 'Create a new event plan',
        description: 'Start with a guided setup and push requirements into vendor procurement.',
        label: 'Open Builder',
        to: '#builder',
        tone: 'brand'
      })
    }

    if (openReqs > 0) {
      cards.push({
        title: `${openReqs} open requirements`,
        description: 'Match the open service slots to the right vendors.',
        label: 'Find Vendors',
        to: '/organizer/procurement',
        tone: 'emerald'
      })
    }

    if (pendingBookings > 0) {
      cards.push({
        title: `${pendingBookings} booking response${pendingBookings > 1 ? 's' : ''}`,
        description: 'Review vendor replies and move the strongest matches forward.',
        label: 'Review Requests',
        to: '/organizer/portfolio',
        tone: 'brand'
      })
    }

    if (contractSent > 0) {
      cards.push({
        title: `${contractSent} contract${contractSent > 1 ? 's' : ''} pending`,
        description: 'Track signatures and finalize procurement with confidence.',
        label: 'Open Portfolio',
        to: '/organizer/portfolio',
        tone: 'slate'
      })
    }

    return cards.slice(0, 3)
  }, [events.length, eventStatusSummary?.total, requirementSummary?.open, bookingSummary?.pending, bookingSummary?.contractSent])

  const recentActivity = summary?.recentActivity ?? []
  const upcomingEvent = summary?.upcomingEvents?.[0] ?? events[0]
  const upcomingEventDate = upcomingEvent
    ? ('eventDate' in upcomingEvent ? upcomingEvent.eventDate : upcomingEvent.event_date)
    : ''

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          title="Organizer Dashboard"
          subtitle="Create events, manage vendor procurement, and track event progress from one workspace."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => navigate('/organizer/procurement')}>
                Find vendors
              </Button>
              <Button onClick={() => document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Build event
              </Button>
            </div>
          }
        />

        <RealtimeIndicator
          snapshot={realtimeSnapshot}
          refreshing={realtimeRefreshing || loading}
          onRefresh={() => {
            void onRefreshRealtime()
            void onLoadEvents()
          }}
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section id="builder" className="scroll-mt-24">
          <DashboardCommandPanel
            meta="Event setup"
            title="Create a guided event plan"
            description="Select the event type, define the setup, choose services, and send the plan into procurement."
            action={
              <Button variant="secondary" onClick={() => navigate('/organizer/procurement')}>
                Continue to procurement
              </Button>
            }
            secondary={
              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Current events</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{eventStatusSummary?.total ?? events.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Open requirements</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{requirementSummary?.open ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending bookings</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{bookingSummary?.pending ?? 0}</p>
                </div>
              </div>
            }
          />

          <EventSetupBuilder existingEventCount={events.length} onSubmit={onCreateEvent} submitting={submitting} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total events" value={eventStatusSummary?.total ?? events.length} color="text-slate-950" sub="All active event plans" />
          <SummaryCard label="Open requirements" value={requirementSummary?.open ?? 0} color="text-emerald-700" sub="Services waiting for vendor matching" />
          <SummaryCard label="Pending bookings" value={bookingSummary?.pending ?? 0} color="text-indigo-700" sub="Responses from vendors" />
          <SummaryCard label="Upcoming events" value={summary?.upcomingEvents?.length ?? 0} color="text-amber-700" sub={upcomingEvent ? upcomingEvent.title : 'Nothing on the calendar yet'} />
        </section>

        {actionCards.length > 0 && (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {actionCards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => {
                  if (card.to === '#builder') {
                    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    return
                  }
                  navigate(card.to)
                }}
                className={`group rounded-[24px] border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  card.tone === 'brand'
                    ? 'border-brand-200 bg-brand-50'
                    : card.tone === 'emerald'
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Action</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{card.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">{card.label}</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                  Open workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </section>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Your events</h2>
                <p className="text-sm text-slate-500">Select an event to continue procurement or review its portfolio.</p>
              </div>
              {events.length > 0 && (
                <Button variant="ghost" onClick={() => navigate('/organizer/portfolio')}>
                  Portfolio
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-64 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                title="No events yet"
                description="Use the guided builder above to create your first event and start vendor procurement."
                action={<Button onClick={() => document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Start planning</Button>}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <PlaceholderMedia
                      title={event.title}
                      subtitle={`${event.venue} · ${formatDate(event.event_date)}`}
                      tone={event.status === 'confirmed' ? 'emerald' : event.status === 'planning' ? 'indigo' : 'slate'}
                      icon={<CalendarDays className="h-5 w-5" />}
                    />
                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">{event.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{event.venue}</p>
                        </div>
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Date</p>
                          <p className="mt-1 font-medium text-slate-900">{formatDate(event.event_date)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Budget</p>
                          <p className="mt-1 font-medium text-slate-900">${Number(event.budget).toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Guests</p>
                          <p className="mt-1 font-medium text-slate-900">{event.expected_guests}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">State</p>
                          <p className="mt-1 font-medium text-slate-900 capitalize">{event.status}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => onSelectEvent(event.id)}
                          className="flex-1"
                        >
                          Continue procurement
                        </Button>
                        {onNavigateToPortfolio && (
                          <Button
                            variant="secondary"
                            onClick={() => onNavigateToPortfolio(event.id)}
                          >
                            Portfolio
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-2 text-white">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Recent activity</h3>
                  <p className="text-sm text-slate-500">Status movement across the event pipeline.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-950">{item.previous_status ?? 'Created'} → {item.new_status}</p>
                      <StatusBadge status={item.new_status} size="sm" />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.reason || 'No additional notes were provided.'}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                )) : (
                  <EmptyState
                    title="No recent activity"
                    description="Activity will show up after event creation, requirement updates, and vendor responses."
                  />
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Next up</p>
                  <h3 className="mt-2 text-2xl font-semibold">{upcomingEvent ? upcomingEvent.title : 'No upcoming event'}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {upcomingEvent ? `Scheduled for ${formatDate(upcomingEventDate)}` : 'Create an event to see the next milestone.'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="h-4 w-4" />
                  <span>{upcomingEvent && 'venue' in upcomingEvent ? upcomingEvent.venue : upcomingEvent?.title ? 'Venue will appear after creation' : 'Venue pending'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Users className="h-4 w-4" />
                  <span>{upcomingEvent && 'expected_guests' in upcomingEvent ? `${upcomingEvent.expected_guests} guests` : `${eventStatusSummary?.total ?? 0} events in pipeline`}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Wallet className="h-4 w-4" />
                  <span>{upcomingEvent && 'budget' in upcomingEvent ? `$${Number(upcomingEvent.budget).toLocaleString()} budget` : 'Budget snapshot from builder'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock3 className="h-4 w-4" />
                  <span>{realtimeSnapshot ? 'Realtime updates are active' : 'Realtime updates are ready'}</span>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full" variant="secondary" onClick={() => navigate('/organizer/procurement')}>
                  Review matching vendors
                </Button>
              </div>
            </section>
          </aside>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Planning overview</h2>
                <p className="text-sm text-slate-500">Keep the organizer workflow visible from creation to procurement.</p>
              </div>
              <FolderKanban className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Event flow</p>
                <p className="mt-2 text-sm text-slate-600">Create event, select services, send requests, compare vendors, and confirm contracts.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Procurement</p>
                <p className="mt-2 text-sm text-slate-600">Each selected service is converted into a vendor requirement to move the search forward.</p>
              </div>
            </div>
          </div>
          <PlaceholderMedia
            title="Organizer workspace"
            subtitle="Event cards, services, and planning milestones stay visually consistent across the dashboard."
            tone="indigo"
            icon={<LayoutGrid className="h-5 w-5" />}
          />
        </section>
      </div>
    </DashboardShell>
  )
}
