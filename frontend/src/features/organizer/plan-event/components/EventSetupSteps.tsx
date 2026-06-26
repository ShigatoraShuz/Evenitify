import { STEP_LABELS } from '../models/planEvent.model'

interface EventSetupStepsProps {
  currentStep: number
}

export function EventSetupSteps({ currentStep }: EventSetupStepsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible">
      {STEP_LABELS.map((label, index) => {
        const active = index === currentStep
        const complete = index < currentStep
        return (
          <div
            key={label}
            className={`flex min-w-[8.75rem] items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 lg:min-w-0 ${
              active
                ? 'border-brand-500 bg-brand-50'
                : complete
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              active
                ? 'bg-brand-600 text-white'
                : complete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
            }`}>
              {index + 1}
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Step {index + 1}</p>
              <p className="text-xs font-semibold leading-4 text-slate-950">{label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
