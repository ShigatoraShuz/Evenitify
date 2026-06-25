import { FileEdit, Trash2, Play, Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react'

export interface DraftEvent {
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

export function DraftEventsTab({ drafts = [], onContinue, onEdit, onDelete }: Props) {
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
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full whitespace-nowrap">
              {draft.progress}% complete
            </span>
          </div>

          <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, draft.progress))}%` }}
              role="progressbar"
              aria-valuenow={Math.max(0, Math.min(100, draft.progress))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${draft.title} completion`}
            />
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{draft.venue}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(draft.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{draft.guests} guests</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Saved {new Date(draft.lastSaved).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onContinue(draft.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Continue
            </button>
            <button
              type="button"
              onClick={() => onEdit(draft.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Edit
            </button>
            <button
              type="button"
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
