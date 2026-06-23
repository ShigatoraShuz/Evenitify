import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Modal } from '../../../shared/components/Modal'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { LargeEvent } from '../../../services/eventService'

import type { DashboardSummary } from '../../../services/eventService'

interface OrganizerDashboardViewProps {
  events: LargeEvent[]
  summary: DashboardSummary | null
  loading: boolean
  submitting: boolean
  error: string | null
  onLoadEvents: () => Promise<void>
  onCreateEvent: (payload: { title: string; eventDate: string; venue: string; budget: number; expectedGuests: number }) => Promise<void>
  onSelectEvent: (eventId: string) => void
  onNavigateToPortfolio?: (eventId: string) => void
}

export function OrganizerDashboardView({
  events,
  summary,
  loading,
  submitting,
  error,
  onLoadEvents,
  onCreateEvent,
  onSelectEvent,
  onNavigateToPortfolio
}: OrganizerDashboardViewProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [budget, setBudget] = useState('')
  const [guests, setGuests] = useState('')

  useEffect(() => { onLoadEvents() }, [])

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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{summary.eventStatusSummary.total}</p>
            <p className="text-sm text-gray-500">Total Events</p>
            <div className="flex gap-2 mt-2 text-xs text-gray-400">
              <span className="text-blue-600">{summary.eventStatusSummary.booking} booking</span>
              <span className="text-green-600">{summary.eventStatusSummary.confirmed} confirmed</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{summary.requirementSummary.total}</p>
            <p className="text-sm text-gray-500">Requirements</p>
            <div className="flex gap-2 mt-2 text-xs text-gray-400">
              <span className="text-yellow-600">{summary.requirementSummary.open} open</span>
              <span className="text-green-600">{summary.requirementSummary.fulfilled} fulfilled</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{summary.bookingSummary.total}</p>
            <p className="text-sm text-gray-500">Bookings</p>
            <div className="flex gap-2 mt-2 text-xs text-gray-400">
              <span className="text-yellow-600">{summary.bookingSummary.pending} pending</span>
              <span className="text-green-600">{summary.bookingSummary.completed} completed</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{summary.upcomingEvents.length}</p>
            <p className="text-sm text-gray-500">Upcoming Events</p>
            <div className="mt-2 text-xs text-gray-400">
              {summary.upcomingEvents.slice(0, 2).map((e) => (
                <p key={e.id}>{e.title} - {new Date(e.eventDate).toLocaleDateString()}</p>
              ))}
              {summary.upcomingEvents.length === 0 && <p>No upcoming events</p>}
            </div>
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
