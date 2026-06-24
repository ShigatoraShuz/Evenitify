import { Building2, Repeat2, ShieldCheck, Store } from 'lucide-react'
import type { UserRole } from '../../../services/authService'

interface ChooseRoleViewProps {
  loading: boolean
  onChoose: (roles: UserRole[]) => Promise<void>
  onBack: () => void
}

type RoleOption = {
  label: string
  roles: UserRole[]
  icon: React.ComponentType<{ className?: string }>
  description: string
  details: string[]
  tone: 'brand' | 'emerald' | 'violet'
}

const OPTIONS: RoleOption[] = [
  {
    label: 'Organizer',
    roles: ['organizer'],
    icon: Building2,
    description: 'Run large event portfolios, compare vendors, and move procurement forward.',
    details: ['Event portfolios', 'Vendor discovery', 'Contract timelines'],
    tone: 'brand',
  },
  {
    label: 'Vendor',
    roles: ['vendor'],
    icon: Store,
    description: 'Manage B2B requests, packages, availability, and signed bookings.',
    details: ['Request queue', 'Service packages', 'Availability'],
    tone: 'emerald',
  },
  {
    label: 'Dual role',
    roles: ['organizer', 'vendor'],
    icon: Repeat2,
    description: 'Switch between organizer and vendor work in one account.',
    details: ['Role switcher', 'Two workspaces', 'Shared identity'],
    tone: 'violet',
  },
]

const toneClasses = {
  brand: 'border-brand-200 bg-brand-50 text-brand-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  violet: 'border-violet-200 bg-violet-50 text-violet-900',
} as const

export function ChooseRoleView({ loading, onChoose, onBack }: ChooseRoleViewProps) {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Role selection</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tighter text-slate-950 sm:text-4xl">Choose how you want to use Eventify.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Select the workspace that matches your job. You can still switch roles later if your account supports more than one.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.label}
                type="button"
                disabled={loading}
                onClick={() => onChoose(option.roles)}
                className={`group rounded-[28px] border p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[option.tone]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ShieldCheck className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
                </div>
                <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">{option.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {option.details.map((detail) => (
                    <span key={detail} className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {detail}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-sm leading-6 text-slate-600">Your role controls the navigation, dashboard, and onboarding flow you will see next.</p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
