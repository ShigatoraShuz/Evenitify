import { CheckCircle2, Calendar, MapPin, Users, DollarSign, ExternalLink } from 'lucide-react'

interface CompletedEvent {
  id: string
  title: string
  eventType: string
  venue: string
  eventDate: string
  guests: number
  budget: number
  servicesRequested: number
  servicesConfirmed: number
  completedAt: string
}

interface Props {
  events?: CompletedEvent[]
  onViewMarketplace: (eventId: string) => void
}

const MOCK_COMPLETED: CompletedEvent[] = [
  { id: 'evt-1', title: 'Horizon Capital Summit', eventType: 'Corporate event', venue: 'New York, NY', eventDate: '2026-08-15', guests: 750, budget: 75000, servicesRequested: 4, servicesConfirmed: 1, completedAt: '2026-06-24T10:30:00Z' },
  { id: 'evt-4', title: 'Annual Awards Night', eventType: 'Corporate event', venue: 'Philadelphia, PA', eventDate: '2026-10-05', guests: 1000, budget: 85000, servicesRequested: 3, servicesConfirmed: 1, completedAt: '2026-06-15T14:00:00Z' },
]

export function CompletedEventBriefsTab({ events = MOCK_COMPLETED, onViewMarketplace }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No completed briefs</h3>
        <p className="text-sm text-slate-500">Completed event briefs will appear here with marketplace status.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-slate-900">{event.title}</h3>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{event.eventType}</p>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
              Brief completed
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.venue}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.guests.toLocaleString()} guests</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${event.budget.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
            <span className="flex items-center gap-1">
              <span className="text-navy-600 font-semibold">{event.servicesRequested}</span> services requested
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600 font-semibold">{event.servicesConfirmed}</span> confirmed
            </span>
          </div>

          <button
            onClick={() => onViewMarketplace(event.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Marketplace
          </button>
        </div>
      ))}
    </div>
  )
}
