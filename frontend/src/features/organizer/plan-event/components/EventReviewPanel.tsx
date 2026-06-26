import { PlaceholderMedia } from '../../../../shared/components/PlaceholderMedia'
import type { PlanEventFormState, EventTypeOption } from '../models/planEvent.model'
import { PLAN_EVENT_PREVIEW_VISUALS } from '../models/planEventVisuals'

interface EventReviewPanelProps {
  form: PlanEventFormState
  eventTypeMeta: EventTypeOption
  recommendedServices: string[]
}

export function EventReviewPanel({ form, eventTypeMeta, recommendedServices }: EventReviewPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Event</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{form.title || `${eventTypeMeta.label} planning draft`}</p>
            <p className="mt-2 text-sm text-slate-600">{form.description}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Schedule</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{form.eventDate || 'Date pending'}</p>
            <p className="mt-2 text-sm text-slate-600">{form.eventTime} &middot; {form.durationHours} hours &middot; {form.eventDays} day(s)</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Budget</p>
            <p className="mt-2 text-base font-semibold text-slate-950">${Number(form.budget || 0).toLocaleString()}</p>
            <p className="mt-2 text-sm text-slate-600">{form.guests} guests &middot; {form.setupMode} setup</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[20px] border border-slate-200 bg-white p-3.5">
            <h4 className="text-sm font-semibold text-slate-950">Selected services</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {recommendedServices.map((service) => (
                <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{service}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-3.5">
            <h4 className="text-sm font-semibold text-slate-950">Vendor notes</h4>
            <p className="mt-2 text-sm text-slate-600">{form.vendorNotes}</p>
          </div>
        </div>
      </div>

      <PlaceholderMedia
        title={PLAN_EVENT_PREVIEW_VISUALS.review.title}
        subtitle={PLAN_EVENT_PREVIEW_VISUALS.review.subtitle}
        imageUrl={PLAN_EVENT_PREVIEW_VISUALS.review.imageUrl}
        imageAlt={PLAN_EVENT_PREVIEW_VISUALS.review.imageAlt}
        tone="rose"
        compact
        chips={[
          `Type: ${eventTypeMeta.label}`,
          `Guests: ${form.guests}`,
          `Services: ${recommendedServices.length}`
        ]}
      />
    </div>
  )
}
