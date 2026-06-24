import { FileEdit, Trash2, Play, Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react'

interface DraftEvent {
  id: string
  title: string
  eventType: string
  venue: string
  eventDate: string
  guests: string
  budget: string
  progress: number
  lastSaved: string
}

interface Props {
  drafts?: DraftEvent[]
  onContinue: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const MOCK_DRAFTS: DraftEvent[] = [
  { id: 'draft-1', title: 'Summer Gala 2026', eventType: 'Corporate event', venue: 'Rooftop venue', eventDate: '2026-07-20', guests: '300', budget: '45000', progress: 65, lastSaved: '2026-06-23T16:30:00Z' },
  { id: 'draft-2', title: 'Tech Conference Q3', eventType: 'Conference', venue: 'Convention center', eventDate: '2026-09-10', guests: '1500', budget: '120000', progress: 30, lastSaved: '2026-06-22T11:00:00Z' },
  { id: 'draft-3', title: 'Awards Night', eventType: 'Corporate event', venue: 'Grand ballroom', eventDate: '2026-10-05', guests: '1000', budget: '85000', progress: 85, lastSaved: '2026-06-21T09:15:00Z' },
]

export function DraftEventsTab({ drafts = MOCK_DRAFTS, onContinue, onEdit, onDelete }: Props) {
  if (drafts.length === 0) {
    return (
      <div className="text-center py-16">
        <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No draft events</h3>
        <p className="text-sm text-slate-500">Save a draft while planning an event and it will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <div key={draft.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">{draft.title}</h3>
              <p className="text-sm text-slate-500">{draft.eventType}</p>
            </div>
            <span className="text-xs font-medium text-navy-600 bg-navy-50 px-2.5 py-1 rounded-full whitespace-nowrap">
              {draft.progress}% complete
            </span>
          </div>

          <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-navy-500 to-navy-700 rounded-full transition-all" style={{ width: `${draft.progress}%` }} />
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{draft.venue}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(draft.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{draft.guests} guests</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Saved {new Date(draft.lastSaved).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onContinue(draft.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors"
            >
              <Play className="w-4 h-4" />
              Continue
            </button>
            <button
              onClick={() => onEdit(draft.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(draft.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-500 text-sm font-medium rounded-lg border border-slate-200 hover:bg-red-50 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
