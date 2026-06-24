import { STEP_LABELS } from '../models/planEvent.model'
import type { EventTypeOption } from '../models/planEvent.model'

interface EventBuilderHeaderProps {
  currentStep: number
  progress: number
  eventTypeMeta: EventTypeOption
  recommendedServicesCount: number
  theme: string
}

export function EventBuilderHeader({
  currentStep,
  progress,
  eventTypeMeta,
  recommendedServicesCount,
  theme
}: EventBuilderHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-950 px-5 py-5 text-white md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Event builder</p>
        <h3 className="mt-2 text-2xl font-semibold">{STEP_LABELS[currentStep]}</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Step {currentStep + 1} of {STEP_LABELS.length}. Progress: {progress}%.
        </p>
      </div>
      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Type: {eventTypeMeta.label}</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Theme: {theme}</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Services: {recommendedServicesCount}</div>
      </div>
    </div>
  )
}
