import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Modal } from '../../../shared/components/Modal'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
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
  onCreateEvent: (payload: { title: string; eventDate: string; venue: string; budget: number; expectedGuests: number }) => Promise<void>
  onSelectEvent: (eventId: string) => void
  onNavigateToPortfolio?: (eventId: string) => void
}

interface ActionCard {
  title: string
  description: string
  label: string
  to: string
  priority: 'high' | 'medium' | 'low'
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
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [budget, setBudget] = useState('')
  const [guests, setGuests] = useState('')

  useEffect(() => { onLoadEvents() }, [])

  const actions = useMemo((): ActionCard[] => {
    const result: ActionCard[] = []
    if (!summary?.eventStatusSummary) return result

    const draftEvents = summary.eventStatusSummary.draft ?? 0
    const openReqs = summary.requirementSummary?.open ?? 0
    const pendingBookings = summary.bookingSummary?.pending ?? 0
    const changesRequested = summary.bookingSummary?.changesRequested ?? 0
    const contractSent = summary.bookingSummary?.contractSent ?? 0

    if (events.length === 0) {
      result.push({
        title: 'Create your first event',
        description: 'Start by creating a Large Event to begin vendor procurement.',
        label: 'Create Event',
        to: '#create',
        priority: 'high',
      })
    }

    if (draftEvents > 0) {
      result.push({
        title: `${draftEvents} event${draftEvents > 1 ? 's' : ''} in draft`,
        description: 'Complete the event details to move forward with planning.',
        label: 'View Drafts',
        to: '#',
        priority: 'medium',
      })
    }

    if (openReqs > 0) {
      result.push({
        title: `Post requirements for ${openReqs} open slot${openReqs > 1 ? 's' : ''}`,
        description: 'Add event requirements and find vendors to fulfill them.',
        label: 'Find Vendors',
        to: '/organizer/procurement',
        priority: 'high',
      })
    }

    if (pendingBookings > 0) {
      result.push({
        title: `${pendingBookings} vendor response${pendingBookings > 1 ? 's' : ''} to review`,
        description: 'Review pending vendor bookings and accept or negotiate.',
        label: 'Review Bookings',
        to: '/organizer/portfolio',
        priority: 'high',
      })
    }

    if (changesRequested > 0) {
      result.push({
        title: `${changesRequested} booking${changesRequested > 1 ? 's' : ''} need attention`,
        description: 'Vendors have requested changes to their bookings.',
        label: 'Review Changes',
        to: '/organizer/portfolio',
        priority: 'high',
      })
    }

    if (contractSent > 0) {
      result.push({
        title: `${contractSent} contract${contractSent > 1 ? 's' : ''} waiting for signature`,
        description: 'Review and sign pending contracts.',
        label: 'Sign Contracts',
        to: '/organizer/portfolio',
        priority: 'high',
      })
    }

    if (summary.upcomingEvents?.length > 0) {
      const next = summary.upcomingEvents[0]
      result.push({
        title: `Upcoming: ${next.title}`,
        description: `Scheduled for ${new Date(next.eventDate).toLocaleDateString()}. Check portfolio for progress.`,
        label: 'View Portfolio',
        to: `/organizer/portfolio?eventId=${next.id}`,
        priority: 'medium',
      })
    }

    return result
  }, [summary, events.length])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreateEvent({
      title,
      eventDate,
      venue,
      budget: parseFloat(budget) || 0,
      expectedGuests: parseInt(guests, 10) || 1
    })
    setShowCreate(false)
    setTitle('')
    setEventDate('')
    setVenue('')
    setBudget('')
    setGuests('')
  }

  return (
    <DashboardShell>
      <PageHeader
        title="My Events"
        subtitle="Create or select a Large Event to start vendor procurement"
        action={
          <Button onClick={() => setShowCreate(true)}>+ New Event</Button>
        }
      />
      <div className="mb-4">
        <RealtimeIndicator snapshot={realtimeSnapshot} refreshing={realtimeRefreshing || loading} onRefresh={() => { void onRefreshRealtime(); void onLoadEvents() }} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {summary?.eventStatusSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Total Events"
            value={summary.eventStatusSummary.total ?? 0}
            sub={`${summary.eventStatusSummary.booking ?? 0} booking · ${summary.eventStatusSummary.confirmed ?? 0} confirmed`}
          />
          <SummaryCard
            label="Requirements"
            value={summary.requirementSummary?.total ?? 0}
            color="text-blue-600"
            sub={`${summary.requirementSummary?.open ?? 0} open · ${summary.requirementSummary?.fulfilled ?? 0} fulfilled`}
          />
          <SummaryCard
            label="Bookings"
            value={summary.bookingSummary?.total ?? 0}
            color="text-indigo-600"
            sub={`${summary.bookingSummary?.pending ?? 0} pending · ${summary.bookingSummary?.completed ?? 0} completed`}
          />
          <SummaryCard
            label="Upcoming Events"
            value={summary.upcomingEvents?.length ?? 0}
            sub={(summary.upcomingEvents ?? []).slice(0, 2).map((e: { title: string }) => e.title).join(', ') || 'No upcoming events'}
          />
        </div>
      )}

      {actions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Suggested Actions</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer ${
                  action.priority === 'high'
                    ? 'bg-brand-50 border-brand-200 hover:border-brand-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (action.to === '#create') setShowCreate(true)
                  else navigate(action.to)
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                  {action.priority === 'high' && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-medium">NOW</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{action.description}</p>
                <span className="text-xs text-brand-600 font-medium">{action.label} &rarr;</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create your first Large Event to begin vendor procurement"
          action={<Button onClick={() => setShowCreate(true)}>Create Event</Button>}
        />
      ) : (
        <>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">All Events</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-300 transition-all"
              >
                <button onClick={() => onSelectEvent(event.id)} className="w-full text-left">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <StatusBadge status={event.status} size="sm" />
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>{new Date(event.event_date).toLocaleDateString()}</p>
                    <p>{event.venue}</p>
                    <p>Budget: ${Number(event.budget).toLocaleString()}</p>
                    <p>{event.expected_guests} guests</p>
                  </div>
                </button>
                {onNavigateToPortfolio && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigateToPortfolio(event.id) }}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View Portfolio &rarr;
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Large Event">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Event Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          <Input label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
          <Input label="Budget ($)" type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          <Input label="Expected Guests" type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} required />
          <Button type="submit" loading={submitting} fullWidth>Create Event</Button>
        </form>
      </Modal>
    </DashboardShell>
  )
}
