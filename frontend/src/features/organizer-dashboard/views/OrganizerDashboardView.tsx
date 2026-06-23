import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Modal } from '../../../shared/components/Modal'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { LargeEvent } from '../../../services/eventService'

interface OrganizerDashboardViewProps {
  events: LargeEvent[]
  loading: boolean
  submitting: boolean
  error: string | null
  onLoadEvents: () => Promise<void>
  onCreateEvent: (payload: { title: string; eventDate: string; venue: string; budget: number; expectedGuests: number }) => Promise<void>
  onSelectEvent: (eventId: string) => void
}

export function OrganizerDashboardView({
  events,
  loading,
  submitting,
  error,
  onLoadEvents,
  onCreateEvent,
  onSelectEvent
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
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-300 transition-all"
            >
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
