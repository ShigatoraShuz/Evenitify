import { Archive, Calendar, CheckCircle2, DollarSign, ExternalLink, MapPin, Users } from 'lucide-react'

interface CompletedEvent {
  id: string
  title: string
  eventType: string
  status: string
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

export function CompletedEventBriefsTab({ events = [], onViewMarketplace }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No event briefs yet</h3>
        <p className="text-sm text-slate-500">Created event briefs will appear here once they are saved to the database.</p>
      </div>
    )
  }

  const getStatusLabel = (status: string) => {
    if (status === 'planning') return 'Planning'
    if (status === 'booking') return 'Booking'
    if (status === 'confirmed') return 'Confirmed'
    if (status === 'completed') return 'Completed'
    if (status === 'cancelled') return 'Cancelled'
    return 'Active'
  }

  const getStatusClassName = (status: string) => {
    if (status === 'planning') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (status === 'booking') return 'bg-violet-50 text-violet-700 border-violet-200'
    if (status === 'confirmed') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'completed') return 'bg-green-50 text-green-700 border-green-200'
    if (status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200'
    return 'bg-slate-50 text-slate-700 border-slate-200'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <article key={event.id} className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-900">{event.title}</h3>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{event.eventType}</p>
            </div>
            <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(event.status)}`}>
              {getStatusLabel(event.status)}
            </span>
          </div>

          <div className="grid gap-3 text-xs text-slate-500 mb-4 sm:grid-cols-2">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.venue}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.guests.toLocaleString()} guests</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${event.budget.toLocaleString()}</span>
          </div>

          <div className="mb-5 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 border border-slate-100">
              <span className="text-brand-600 font-semibold">{event.servicesRequested}</span> services requested
            </span>
            <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 border border-slate-100">
              <span className="text-green-600 font-semibold">{event.servicesConfirmed}</span> confirmed
            </span>
          </div>

          <button
            onClick={() => onViewMarketplace(event.id)}
            className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <ExternalLink className="w-4 h-4" />
            View Marketplace
          </button>
        </article>
      ))}
    </div>
  )
}
