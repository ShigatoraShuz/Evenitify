import { useMemo, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CheckCircle2, MapPin, RefreshCw, Users, Wallet } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import type { VendorEventCard } from '../viewmodels/useVendorEventsViewModel'

interface VendorEventsViewProps {
  events: VendorEventCard[]
  loading: boolean
  refreshing: boolean
  submitting: boolean
  error: string | null
  loadedOnce: boolean
  finishingEventId: string | null
  onRefreshEvents: () => Promise<void>
  onCompleteEvent: (bookingId: string) => Promise<void>
  onClearError: () => void
}

function formatCount(value: number) {
  return value.toLocaleString()
}

function MetaTile({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900 break-words">{value}</p>
    </div>
  )
}

function EventCard({
  event,
  submitting,
  finishingEventId,
  onCompleteEvent
}: {
  event: VendorEventCard
  submitting: boolean
  finishingEventId: string | null
  onCompleteEvent: (bookingId: string) => Promise<void>
}) {
  const canComplete = event.canComplete
  const isFinishing = submitting && finishingEventId === event.booking.id

  return (
    <article className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow hover:shadow-[0_10px_36px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold tracking-tight text-slate-900">{event.title}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{event.organizer}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.booking.status} size="sm" />
              <StatusBadge status={event.requirementStatus} size="sm" />
              <StatusBadge status={event.contractStatus} size="sm" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetaTile label="Event date" value={event.eventDateLabel} icon={CalendarDays} />
            <MetaTile label="Venue" value={event.venueLabel} icon={MapPin} />
            <MetaTile label="Guests" value={event.guestsLabel} icon={Users} />
            <MetaTile label="Budget" value={event.budgetLabel} icon={Wallet} />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Requested services</p>
              <span className="text-xs font-semibold text-slate-500">{event.requestedServices.length} item{event.requestedServices.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
              {event.requestedServices.map((service) => (
                <span
                  key={service.id}
                  className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
                >
                  {service.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Organizer notes</p>
              <span className="text-xs font-semibold text-slate-500">Full brief</span>
            </div>
            <div className="mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm leading-relaxed text-slate-700">
              {event.organizerNotes}
            </div>
          </div>
        </div>

        <div className="xl:ml-4 xl:w-56 xl:shrink-0 xl:border-l xl:border-slate-100 xl:pl-4">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Completion</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{event.completionHint}</p>
            </div>
            <Button
              variant={canComplete ? 'primary' : 'secondary'}
              className="w-full gap-2"
              loading={isFinishing}
              disabled={!canComplete}
              onClick={() => void onCompleteEvent(event.booking.id)}
              aria-label={`Mark ${event.title} as finished`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark finished
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function VendorEventsView({
  events,
  loading,
  refreshing,
  submitting,
  error,
  loadedOnce,
  finishingEventId,
  onRefreshEvents,
  onCompleteEvent,
  onClearError
}: VendorEventsViewProps) {
  const navigate = useNavigate()

  const summary = useMemo(() => {
    const readyToFinish = events.filter((event) => event.canComplete).length
    const awaitingContract = events.length - readyToFinish
    return {
      total: events.length,
      readyToFinish,
      awaitingContract
    }
  }, [events])

  if (error === 'Vendor profile not found' || error === 'VENDOR_NOT_FOUND') {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-[1480px]">
          <PageHeader
            title="Events"
            subtitle="Only confirmed bookings appear here. Finish an event once the contract is active."
          />
          <div className="mx-auto mt-12 max-w-2xl">
            <EmptyState
              title="Vendor Profile Required"
              description="Complete your vendor profile to manage confirmed events and mark finished bookings."
              mediaTitle="Events Locked"
              mediaSubtitle="Profile setup incomplete."
              action={<Button onClick={() => navigate('/onboarding')}>Complete Onboarding</Button>}
            />
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <PageHeader
          title="Events"
          subtitle="Confirmed bookings only. Use the check icon to mark an event finished after its active contract is done."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => void onRefreshEvents()}
                loading={refreshing}
                disabled={submitting}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="secondary" onClick={() => navigate('/vendor/bookings')}>
                View Bookings
              </Button>
            </div>
          }
        />

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="font-medium text-rose-500 hover:text-rose-700">
              Dismiss
            </button>
          </div>
        )}

        {loadedOnce && (
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Confirmed</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{formatCount(summary.total)}</p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-600">Ready to finish</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">{formatCount(summary.readyToFinish)}</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600">Awaiting contract</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-amber-700">{formatCount(summary.awaitingContract)}</p>
            </div>
          </section>
        )}

        {loading && !loadedOnce ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-[26px] border border-slate-100 bg-slate-100" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No confirmed events yet"
            description="Confirmed bookings will appear here when organizer requests move into the active event queue."
            action={<Button variant="secondary" onClick={() => navigate('/vendor/bookings')}>Review bookings</Button>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.booking.id}
                event={event}
                submitting={submitting}
                finishingEventId={finishingEventId}
                onCompleteEvent={onCompleteEvent}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
