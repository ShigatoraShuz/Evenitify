import type { PlanEventFormState, EventTypeOption } from '../models/planEvent.model'

interface EventReviewPanelProps {
  form: PlanEventFormState
  eventTypeMeta: EventTypeOption
  recommendedServices: string[]
}

export function EventReviewPanel({ form, eventTypeMeta, recommendedServices }: EventReviewPanelProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Event</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{form.title || `${eventTypeMeta.label} planning draft`}</p>
          <p className="mt-2 text-sm text-slate-600">{form.description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Schedule</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{form.eventDate || 'Date pending'}</p>
          <p className="mt-2 text-sm text-slate-600">{form.eventTime} · {form.durationHours} hours · {form.eventDays} day(s)</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Budget</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">${Number(form.budget).toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-600">{form.guests} guests · {form.setupMode} setup</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-950">Selected services</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {recommendedServices.map((service) => (
              <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{service}</span>
            ))}
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-950">Vendor notes</h4>
          <p className="mt-2 text-sm text-slate-600">{form.vendorNotes}</p>
        </div>
      </div>
    </div>
  )
}
